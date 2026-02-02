import type React from "react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageSection,
  PageSectionVariants,
  Title,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
  FlexItem,
  Gallery,
  Pagination,
  Divider,
  Label,
  Grid,
  GridItem,
  Button,
  Tooltip,
} from "@patternfly/react-core";
import { 
  CopyIcon, 
  DownloadIcon, 
  ClockIcon, 
  UserIcon, 
  CertificateIcon 
} from "@patternfly/react-icons";
import { SearchContext, SearchProvider } from "./search-context";
import { SearchToolbar } from "./search-toolbar";
import { IndexContextSelector } from "./components/index-context-selector";

interface SearchContentProps {
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
}

const SearchContent: React.FC<SearchContentProps> = ({ selectedIndex, setSelectedIndex }) => {
  const {
    searchQuery,
    setSearchQuery,
    currentPageItems,
    page,
    setPage,
    perPage,
    setPerPage,
    filteredItemCount,
  } = useContext(SearchContext);

  const navigate = useNavigate();

  // Copy functionality
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Get display name for the selected index
  const getIndexDisplayName = () => {
    switch (selectedIndex) {
      case "trusted-libraries": return "Trusted Libraries";
      case "aipcc": return "AIPCC";
      default: return "Trusted Libraries";
    }
  };

  // Get index information based on selected index
  const getIndexInfo = () => {
    switch (selectedIndex) {
      case "trusted-libraries":
        return {
          url: "https://packages.redhat.com/simple",
          description: "Curated collection of verified and secure open source packages",
          subscription: "Red Hat Enterprise subscription required",
          support: "enterprise-support@redhat.com",
          contact: "Red Hat Support",
          status: "Online",
          statusDetail: "(Last sync: 2h ago)",
          inventory: "523 Projects",
          lastUpdated: "Updated 2 hours ago"
        };
      case "aipcc":
        return {
          url: "https://aipcc.packages.redhat.com/ai/simple/",
          description: "AI Package Control & Compliance - Government approved AI libraries",
          subscription: "Security clearance required",
          support: "aipcc-support@redhat.com",
          contact: "Red Hat AIPCC Team",
          status: "Online", 
          statusDetail: "(Last sync: 1d ago)",
          inventory: "6 Projects",
          lastUpdated: "Updated 1 day ago"
        };
      default:
        return {
          url: "https://packages.redhat.com/simple",
          description: "Curated collection of verified and secure open source packages",
          subscription: "Red Hat Enterprise subscription required",
          support: "enterprise-support@redhat.com",
          contact: "Red Hat Support",
          status: "Online",
          statusDetail: "(Last sync: 2h ago)",
          inventory: "523 Projects",
          lastUpdated: "Updated 2 hours ago"
        };
    }
  };

  const formatDownloads = (downloads: number): string => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    }
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(0)}K`;
    }
    return downloads.toString();
  };

  const onSearchChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setSearchQuery(value);
  };

  const onSearchClear = () => {
    setSearchQuery("");
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.default}>
        <div style={{ marginBottom: "1rem" }}>
          <IndexContextSelector 
            selectedIndex={selectedIndex}
            onIndexChange={setSelectedIndex}
          />
        </div>
        <Divider style={{ marginBottom: "1rem" }} />
        <Title headingLevel="h1" size="2xl">
          {getIndexDisplayName()} Index
        </Title>
        
        <div style={{ marginTop: "0.375rem", marginBottom: "1.5rem" }}>
          <Label variant="outline" isCompact style={{
            fontSize: "var(--pf-v6-global--FontSize--xs)",
            fontFamily: "var(--pf-v6-global--FontFamily--monospace)",
            color: "var(--pf-v6-global--Color--200)"
          }}>
            {getIndexInfo().url}
          </Label>
        </div>
        
        <div>
          
          <Grid hasGutter>
            {/* Status Card */}
            <GridItem span={12} md={4}>
              <Card style={{ 
                backgroundColor: "var(--pf-v6-global--BackgroundColor--dark-100)",
                border: "1px solid var(--pf-v6-global--BorderColor--200)",
                height: "100%"
              }}>
                <CardBody>
                  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                    <FlexItem>
                      <span style={{ 
                        fontSize: "var(--pf-v6-global--FontSize--lg)", 
                        fontWeight: "600",
                        color: "var(--pf-v6-global--Color--100)"
                      }}>
                        Status
                      </span>
                    </FlexItem>
                    <FlexItem>
                      <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsXs" }}>
                        <FlexItem>
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#3E8635"
                          }} />
                        </FlexItem>
                        <FlexItem>
                          <span style={{ 
                            fontSize: "var(--pf-v6-global--FontSize--md)",
                            color: "var(--pf-v6-global--Color--100)"
                          }}>
                            {getIndexInfo().status} {getIndexInfo().statusDetail}
                          </span>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            
            {/* Inventory Card */}
            <GridItem span={12} md={4}>
              <Card style={{ 
                backgroundColor: "var(--pf-v6-global--BackgroundColor--dark-100)",
                border: "1px solid var(--pf-v6-global--BorderColor--200)",
                height: "100%"
              }}>
                <CardBody>
                  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                    <FlexItem>
                      <span style={{ 
                        fontSize: "var(--pf-v6-global--FontSize--lg)", 
                        fontWeight: "600",
                        color: "var(--pf-v6-global--Color--100)"
                      }}>
                        Inventory
                      </span>
                    </FlexItem>
                    <FlexItem>
                      <span style={{ 
                        fontSize: "var(--pf-v6-global--FontSize--md)",
                        color: "var(--pf-v6-global--Color--100)"
                      }}>
                        {getIndexInfo().inventory}
                      </span>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
            
            {/* Support Card */}
            <GridItem span={12} md={4}>
              <Card style={{ 
                backgroundColor: "var(--pf-v6-global--BackgroundColor--dark-100)",
                border: "1px solid var(--pf-v6-global--BorderColor--200)",
                height: "100%"
              }}>
                <CardBody>
                  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
                    <FlexItem>
                      <span style={{ 
                        fontSize: "var(--pf-v6-global--FontSize--lg)", 
                        fontWeight: "600",
                        color: "var(--pf-v6-global--Color--100)"
                      }}>
                        Support
                      </span>
                    </FlexItem>
                    <FlexItem>
                      <a href={`mailto:${getIndexInfo().support}`} style={{ 
                        fontSize: "var(--pf-v6-global--FontSize--md)",
                        color: "#0066CC",
                        textDecoration: "underline"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "underline"}
                      >
                        {getIndexInfo().contact}
                      </a>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </div>
      </PageSection>
      <PageSection>
        <div
          style={{
            backgroundColor: "var(--pf-v6-global--BackgroundColor--100)",
          }}
        >
          <SearchToolbar 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchClear={onSearchClear}
          />
          {currentPageItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                color: "var(--pf-v6-global--Color--200)",
              }}
            >
              <Title headingLevel="h3" size="lg">
                No packages found
              </Title>
              <p>
                {searchQuery
                  ? `No packages match your search "${searchQuery}"`
                  : "No packages available"}
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: "1rem" }}>
                <Gallery
                  hasGutter
                  minWidths={{
                    default: "100%",
                  }}
                >
                  {currentPageItems.map((pkg) => (
                    <Card
                      key={pkg.id}
                      isCompact
                      // isClickable
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(`/search/${pkg.name}/${pkg.version}`);
                      }}
                      style={{
                        cursor: "pointer",
                        border:
                          "1px solid var(--pf-v6-global--BorderColor--100)",
                        boxShadow: "var(--pf-v6-global--BoxShadow--sm)",
                      }}
                    >
                      <CardHeader>
                        <Flex
                          alignItems={{ default: "alignItemsCenter" }}
                          spaceItems={{ default: "spaceItemsSm" }}
                        >
                          <FlexItem>
                            <Title headingLevel="h3" size="lg">
                              {pkg.name}
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Badge isRead>{pkg.version}</Badge>
                          </FlexItem>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <p>{pkg.description}</p>
                      </CardBody>
                      <CardFooter>
                        <Flex
                          justifyContent={{ default: "justifyContentSpaceBetween" }}
                          alignItems={{ default: "alignItemsCenter" }}
                          style={{
                            fontSize: "var(--pf-v6-global--FontSize--sm)",
                            color: "var(--pf-v6-global--Color--200)",
                          }}
                        >
                          <FlexItem>
                            <Flex spaceItems={{ default: "spaceItemsLg" }}>
                              <FlexItem>
                                <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsNone" }}>
                                  <FlexItem>
                                    <DownloadIcon style={{ fontSize: "14px", color: "#9ca3af" }} />
                                  </FlexItem>
                                  <FlexItem style={{ marginLeft: "8px" }}>
                                    {formatDownloads(pkg.downloads)} downloads
                                  </FlexItem>
                                </Flex>
                              </FlexItem>
                              <FlexItem>
                                <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsNone" }}>
                                  <FlexItem>
                                    <ClockIcon style={{ fontSize: "14px", color: "#9ca3af" }} />
                                  </FlexItem>
                                  <FlexItem style={{ marginLeft: "8px" }}>
                                    Updated {pkg.updated}
                                  </FlexItem>
                                </Flex>
                              </FlexItem>
                              <FlexItem>
                                <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsNone" }}>
                                  <FlexItem>
                                    <UserIcon style={{ fontSize: "14px", color: "#9ca3af" }} />
                                  </FlexItem>
                                  <FlexItem style={{ marginLeft: "8px" }}>
                                    {pkg.author}
                                  </FlexItem>
                                </Flex>
                              </FlexItem>
                              <FlexItem>
                                <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsNone" }}>
                                  <FlexItem>
                                    <CertificateIcon style={{ fontSize: "14px", color: "#9ca3af" }} />
                                  </FlexItem>
                                  <FlexItem style={{ marginLeft: "8px" }}>
                                    {pkg.license}
                                  </FlexItem>
                                </Flex>
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Tooltip content="Copy pip install command">
                              <Button
                                variant="plain"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`pip install ${pkg.name}`);
                                }}
                                style={{
                                  padding: "4px 8px",
                                  minWidth: "auto",
                                  height: "auto",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "var(--pf-v6-global--Color--200)",
                                  borderRadius: "4px",
                                  transition: "all 0.2s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "var(--pf-v6-global--FontSize--sm)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
                                  const textNodes = e.currentTarget.childNodes;
                                  for (let node of textNodes) {
                                    if (node.nodeType === Node.TEXT_NODE) {
                                      e.currentTarget.style.color = "var(--pf-v6-global--Color--100)";
                                    }
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "var(--pf-v6-global--Color--200)";
                                }}
                                aria-label="Copy pip install command"
                              >
                                <CopyIcon style={{ 
                                  width: "12px", 
                                  height: "12px", 
                                  marginRight: "8px",
                                  color: "#9ca3af",
                                  transform: "translateY(2px)"
                                }} />
                                <span style={{ color: "var(--pf-v6-global--Color--200)" }}>
                                  pip install
                                </span>
                              </Button>
                            </Tooltip>
                          </FlexItem>
                        </Flex>
                      </CardFooter>
                    </Card>
                  ))}
                </Gallery>
              </div>
              <div
                style={{
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Pagination
                  itemCount={filteredItemCount}
                  perPage={perPage}
                  page={page}
                  onSetPage={(_event, newPage) => setPage(newPage)}
                  onPerPageSelect={(_event, newPerPage) =>
                    setPerPage(newPerPage)
                  }
                  perPageOptions={[
                    { title: "10", value: 10 },
                    { title: "20", value: 20 },
                    { title: "50", value: 50 },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      </PageSection>
    </>
  );
};

export const Search: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<string>("trusted-libraries");

  return (
    <SearchProvider selectedIndex={selectedIndex}>
      <SearchContent selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
    </SearchProvider>
  );
};
