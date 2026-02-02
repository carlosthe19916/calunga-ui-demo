import type React from "react";
import { createContext, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import dummyData from "./dummy-data.json";

export interface SBOMSummary {
  totalComponents: number;
  directDependencies: number;
  licensesFound: string[];
  criticalDependencies?: string[];
  hasVulnerabilities?: boolean;
}

export interface SBOM {
  format: string;
  url: string;
  generatedAt: string;
  // NEW FIELDS
  version?: string;
  componentCount?: number;
  serialNumber?: string;
  toolName?: string;
  toolVersion?: string;
  summary?: SBOMSummary;
}

export interface Attestation {
  type: string;
  verifier: string;
  timestamp: string;
  status: "verified" | "unverified" | "failed";
  // NEW FIELDS
  slsaLevel?: number;
  certificateUrl?: string;
  signatureUrl?: string;
  digestSha256?: string;
  issuer?: string;
  subject?: string;
  validUntil?: string;
  buildPlatform?: string;
  metadata?: Record<string, unknown>;
}

export interface PackageVersion {
  version: string;
  releaseDate: string;
  downloads: number;
  sbom?: SBOM;
  attestations?: Attestation[];
}

export interface Dependent {
  name: string;
  version: string;
  downloads: number;
}

export interface SecurityAdvisory {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedVersions: string[];
  publishedAt: string;
}

export interface Package {
  id: string;
  name: string;
  version: string;
  description: string;
  downloads: number;
  updated: string;
  author: string;
  license: string;

  // Optional fields for detail page
  fullDescription?: string;
  tags?: string[];
  wheelName?: string;
  pythonVersion?: string;
  abi?: string;
  architecture?: string;
  index?: string; // NEW: Package index (github, artifactory, nexus)
  versions?: PackageVersion[];
  dependents?: Dependent[];
  securityAdvisories?: SecurityAdvisory[];

  // NEW FIELDS for attestations and trust
  currentVersionAttestations?: Attestation[];
  currentVersionSbom?: SBOM;
  trustScore?: number;
  slsaLevel?: number;
}

export type SortOption = "relevance" | "date" | "downloads";

// Filter types
export interface FilterValues {
  index: string[];
  classification: string[];
  license: string[];
}

interface ISearchContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  currentPageItems: Package[];
  totalItemCount: number;
  filteredItemCount: number;
  // NEW: Filter state
  filters: FilterValues;
  setFilter: (category: keyof FilterValues, values: string[]) => void;
  clearAllFilters: () => void;
  deleteFilter: (category: keyof FilterValues, value: string) => void;
}

const contextDefaultValue = {} as ISearchContext;

export const SearchContext = createContext<ISearchContext>(contextDefaultValue);

interface ISearchProvider {
  children: React.ReactNode;
  selectedIndex?: string;
}

export const SearchProvider: React.FunctionComponent<ISearchProvider> = ({
  children,
  selectedIndex = "trusted-libraries",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQueryState] = useState(
    searchParams.get("q") || "",
  );
  const [sortBy, setSortByState] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "relevance",
  );
  const [page, setPageState] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [perPage, setPerPageState] = useState(
    parseInt(searchParams.get("perPage") || "10", 10),
  );

  // Initialize filter state from URL params
  const [filters, setFiltersState] = useState<FilterValues>(() => {
    const indexParam = searchParams.get("index");
    const classificationParam = searchParams.get("classification");
    const licenseParam = searchParams.get("license");

    return {
      index: indexParam ? indexParam.split(",") : [],
      classification: classificationParam ? classificationParam.split(",") : [],
      license: licenseParam ? licenseParam.split(",") : [],
    };
  });

  // Update URL params when state changes
  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      setPageState(1); // Reset to page 1 when search changes
      const newParams = new URLSearchParams(searchParams);
      if (query) {
        newParams.set("q", query);
      } else {
        newParams.delete("q");
      }
      newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const setSortBy = useCallback(
    (sort: SortOption) => {
      setSortByState(sort);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("sort", sort);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const setPerPage = useCallback(
    (newPerPage: number) => {
      setPerPageState(newPerPage);
      setPageState(1); // Reset to page 1 when perPage changes
      const newParams = new URLSearchParams(searchParams);
      newParams.set("perPage", newPerPage.toString());
      newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Filter management functions
  const setFilter = useCallback(
    (category: keyof FilterValues, values: string[]) => {
      setFiltersState((prev) => ({ ...prev, [category]: values }));
      setPageState(1); // Reset to page 1 when filters change
      const newParams = new URLSearchParams(searchParams);

      // Map category to URL param name
      const paramMap: Record<keyof FilterValues, string> = {
        index: "index",
        classification: "classification",
        license: "license",
      };

      const paramName = paramMap[category];
      if (values.length > 0) {
        newParams.set(paramName, values.join(","));
      } else {
        newParams.delete(paramName);
      }
      newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const deleteFilter = useCallback(
    (category: keyof FilterValues, value: string) => {
      setFiltersState((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
      setPageState(1);
      const newParams = new URLSearchParams(searchParams);

      const paramMap: Record<keyof FilterValues, string> = {
        index: "index",
        classification: "classification",
        license: "license",
      };

      const paramName = paramMap[category];
      const updatedValues = filters[category].filter((v) => v !== value);

      if (updatedValues.length > 0) {
        newParams.set(paramName, updatedValues.join(","));
      } else {
        newParams.delete(paramName);
      }
      newParams.set("page", "1");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, filters],
  );

  const clearAllFilters = useCallback(() => {
    setFiltersState({
      index: [],
      classification: [],
      license: [],
    });
    setPageState(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("index");
    newParams.delete("classification");
    newParams.delete("arch");
    newParams.set("page", "1");
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Load mock data
  const allPackages: Package[] = dummyData;

  // Filter packages based on selected index and show only latest versions
  const packages = useMemo(() => {
    let selectedPackages: Package[];
    
    if (selectedIndex === "aipcc") {
      // Show 6 packages from "page 3" (packages 20-25)
      selectedPackages = allPackages.slice(20, 26);
    } else {
      // For "trusted-libraries" show all packages
      selectedPackages = allPackages;
    }
    
    // Group packages by name and keep only the latest version
    const packagesByName = new Map<string, Package>();
    
    selectedPackages.forEach((pkg) => {
      const existingPkg = packagesByName.get(pkg.name);
      
      if (!existingPkg) {
        // First package with this name
        packagesByName.set(pkg.name, pkg);
      } else {
        // Compare versions to keep the latest
        // Simple version comparison - for more complex versioning, would need semver
        const currentVersion = pkg.version;
        const existingVersion = existingPkg.version;
        
        // Remove any pre-release suffixes for comparison
        const normalizeVersion = (version: string) => {
          return version.replace(/[a-zA-Z].*$/, ''); // Remove rc, alpha, beta, etc.
        };
        
        const currentNormalized = normalizeVersion(currentVersion);
        const existingNormalized = normalizeVersion(existingVersion);
        
        // Split version numbers and compare
        const currentParts = currentNormalized.split('.').map(Number);
        const existingParts = existingNormalized.split('.').map(Number);
        
        let isNewer = false;
        for (let i = 0; i < Math.max(currentParts.length, existingParts.length); i++) {
          const currentPart = currentParts[i] || 0;
          const existingPart = existingParts[i] || 0;
          
          if (currentPart > existingPart) {
            isNewer = true;
            break;
          } else if (currentPart < existingPart) {
            break;
          }
        }
        
        // If versions are equal, prefer non-pre-release versions
        if (!isNewer && currentNormalized === existingNormalized) {
          const currentHasPreRelease = currentVersion !== currentNormalized;
          const existingHasPreRelease = existingVersion !== existingNormalized;
          
          if (!currentHasPreRelease && existingHasPreRelease) {
            isNewer = true;
          }
        }
        
        if (isNewer) {
          packagesByName.set(pkg.name, pkg);
        }
      }
    });
    
    return Array.from(packagesByName.values());
  }, [selectedIndex]);

  // Filter packages based on search query and filters
  const filteredPackages = useMemo(() => {
    let filtered = packages;

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query) ||
          pkg.author.toLowerCase().includes(query),
      );
    }

    // Apply index filter
    if (filters.index.length > 0) {
      filtered = filtered.filter((pkg) =>
        pkg.index ? filters.index.includes(pkg.index) : false,
      );
    }

    // Apply classification filter
    if (filters.classification.length > 0) {
      filtered = filtered.filter((pkg) => {
        if (!pkg.tags) return false;
        // Check if package has any of the selected classifications/tags
        return filters.classification.some((classification) =>
          pkg.tags?.some(tag => 
            tag.toLowerCase().includes(classification.toLowerCase()) ||
            classification.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Apply license filter
    if (filters.license.length > 0) {
      filtered = filtered.filter((pkg) =>
        pkg.license
          ? filters.license.includes(pkg.license)
          : false,
      );
    }

    return filtered;
  }, [searchQuery, filters, packages, selectedIndex]);

  // Sort packages based on sortBy
  const sortedPackages = useMemo(() => {
    const sorted = [...filteredPackages];
    switch (sortBy) {
      case "date":
        // Sort by most recently updated
        // For demo purposes, using a simple heuristic based on the "updated" text
        sorted.sort((a, b) => {
          const getUpdateValue = (updated: string) => {
            if (updated.includes("day")) {
              const days = parseInt(updated, 10);
              return days || 1;
            }
            if (updated.includes("week")) {
              const weeks = parseInt(updated, 10);
              return (weeks || 1) * 7;
            }
            if (updated.includes("month")) {
              const months = parseInt(updated, 10);
              return (months || 1) * 30;
            }
            return 999;
          };
          return getUpdateValue(a.updated) - getUpdateValue(b.updated);
        });
        break;
      case "downloads":
        sorted.sort((a, b) => b.downloads - a.downloads);
        break;
      default:
        // If there's a search query, sort by name match first, then by downloads
        if (searchQuery) {
          sorted.sort((a, b) => {
            const aNameMatch = a.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const bNameMatch = b.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            return b.downloads - a.downloads;
          });
        } else {
          // No search query, sort by downloads
          sorted.sort((a, b) => b.downloads - a.downloads);
        }
        break;
    }
    return sorted;
  }, [filteredPackages, sortBy, searchQuery]);

  // Paginate packages
  const currentPageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedPackages.slice(start, start + perPage);
  }, [sortedPackages, page, perPage]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        page,
        setPage,
        perPage,
        setPerPage,
        currentPageItems,
        totalItemCount: packages.length,
        filteredItemCount: sortedPackages.length,
        filters,
        setFilter,
        clearAllFilters,
        deleteFilter,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
