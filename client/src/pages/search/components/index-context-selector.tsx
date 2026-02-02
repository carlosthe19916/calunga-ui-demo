import type React from "react";
import { useState, useMemo } from "react";
import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  type MenuToggleElement,
  MenuSearch,
  MenuSearchInput,
  TextInput,
  Divider,
  Tooltip,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { QuestionCircleIcon } from "@patternfly/react-icons";

const indexOptions = [
  { value: "trusted-libraries", label: "Trusted Libraries" },
  { value: "aipcc", label: "AIPCC" },
];

interface IndexContextSelectorProps {
  selectedIndex?: string;
  onIndexChange?: (index: string) => void;
}

export const IndexContextSelector: React.FC<IndexContextSelectorProps> = ({
  selectedIndex: controlledSelectedIndex = "trusted-libraries",
  onIndexChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<string>("trusted-libraries");
  
  const selectedIndex = onIndexChange ? controlledSelectedIndex : internalSelectedIndex;
  const [searchValue, setSearchValue] = useState<string>("");

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    const selectedValue = value as string;
    if (onIndexChange) {
      onIndexChange(selectedValue);
    } else {
      setInternalSelectedIndex(selectedValue);
    }
    setIsOpen(false);
    setSearchValue(""); // Clear search when closing
  };

  const onSearchChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setSearchValue(value);
  };

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) {
      return indexOptions;
    }
    return indexOptions.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue]);

  // Get toggle label based on selection
  const getToggleLabel = () => {
    const option = indexOptions.find((opt) => opt.value === selectedIndex);
    return option?.label || "Trusted Libraries";
  };

  return (
    <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
      <FlexItem>
        <Dropdown
          isOpen={isOpen}
          onSelect={onSelect}
          onOpenChange={(isOpen: boolean) => {
            setIsOpen(isOpen);
            if (!isOpen) {
              setSearchValue(""); // Clear search when closing
            }
          }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              onClick={onToggle}
              isExpanded={isOpen}
              style={{
                width: "200px",
              }}
            >
              {getToggleLabel()}
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
          isScrollable
        >
          <MenuSearch>
            <MenuSearchInput
              style={{
                paddingTop: "4px",
                paddingBottom: "0",
                marginBottom: "0"
              }}
            >
              <TextInput
                type="search"
                placeholder="Search"
                aria-label="Search input"
                value={searchValue}
                onChange={(e, value) => onSearchChange(e, value)}
              />
            </MenuSearchInput>
          </MenuSearch>
          <Divider style={{ margin: "0" }} />
          <DropdownList>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  value={option.value}
                  isSelected={selectedIndex === option.value}
                >
                  {option.label}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem isDisabled>No results found</DropdownItem>
            )}
          </DropdownList>
        </Dropdown>
      </FlexItem>
      <FlexItem>
        <Tooltip content="Select the package source index to search. Different indexes contain packages from different ecosystems and repositories.">
          <QuestionCircleIcon 
            style={{ 
              color: "#6A6E73",
              cursor: "help"
            }} 
          />
        </Tooltip>
      </FlexItem>
    </Flex>
  );
};
