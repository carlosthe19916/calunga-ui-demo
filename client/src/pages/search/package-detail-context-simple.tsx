import type React from "react";
import { createContext, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Package } from "./search-context";
import dummyData from "./dummy-data.json";

export type TabKey = "overview" | "versions" | "files" | "security";

interface IPackageDetailContext {
  packageData: Package | null;
  tabControls: {
    activeKey: TabKey;
    setActiveKey: (key: TabKey) => void;
  };
}

const contextDefaultValue = {} as IPackageDetailContext;

export const PackageDetailContext =
  createContext<IPackageDetailContext>(contextDefaultValue);

interface IPackageDetailProvider {
  packageName: string;
  version: string;
  children: React.ReactNode;
}

export const PackageDetailProvider: React.FunctionComponent<
  IPackageDetailProvider
> = ({ packageName, version, children }) => {
  // Load package data from dummy data
  const packageData = useMemo(() => {
    const packages: Package[] = dummyData;
    const found = packages.find((pkg) => pkg.name === packageName && pkg.version === version);
    console.log('Loading package:', packageName, version, 'Found:', !!found);
    return found || null;
  }, [packageName, version]);

  // Get initial tab from URL params
  const location = useLocation();
  const getInitialTab = (): TabKey => {
    const params = new URLSearchParams(location.search);
    const activeTab = params.get('activeTab') as TabKey;
    return activeTab && ['overview', 'versions', 'files', 'security'].includes(activeTab) 
      ? activeTab 
      : 'overview';
  };

  const [activeKey, setActiveKey] = useState<TabKey>(getInitialTab);

  // Update URL when tab changes
  const setActiveKeyWithUrl = (key: TabKey) => {
    setActiveKey(key);
    const url = new URL(window.location.href);
    url.searchParams.set('activeTab', key);
    window.history.replaceState({}, '', url.toString());
  };

  // Listen for URL changes
  useEffect(() => {
    const handlePopState = () => {
      setActiveKey(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PackageDetailContext.Provider
      value={{
        packageData,
        tabControls: {
          activeKey,
          setActiveKey: setActiveKeyWithUrl,
        },
      }}
    >
      {children}
    </PackageDetailContext.Provider>
  );
};