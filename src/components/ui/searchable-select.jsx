"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchableSelect = React.forwardRef(
  (
    {
      options = [],
      value,
      onValueChange,
      placeholder = "Select an option...",
      searchPlaceholder = "Search...",
      className,
      disabled = false,
      getOptionLabel = (option) => option.label || option.name || "",
      getOptionValue = (option) => option.value || option.id || "",
      renderOption = null,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;
      return options.filter((option) =>
        getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm, getOptionLabel]);

    // Find selected option
    const selectedOption = React.useMemo(() => {
      return options.find((option) => getOptionValue(option) === value);
    }, [options, value, getOptionValue]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const handleSelect = (option) => {
      onValueChange?.(getOptionValue(option));
      setIsOpen(false);
      setSearchTerm("");
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    return (
      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "flex h-12 md:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
            className
          )}
          {...props}
        >
          <span className="line-clamp-1 text-left">
            {selectedOption ? (
              renderOption ? (
                renderOption(selectedOption)
              ) : (
                getOptionLabel(selectedOption)
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[8rem] max-w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            {/* Search Input */}
            <div className="flex items-center border-b px-3 py-3 md:py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-base md:text-sm touch-manipulation"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-3 text-sm text-muted-foreground">
                  {searchTerm ? "No results found." : "No options available."}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = getOptionValue(option);
                  const isSelected = optionValue === value;

                  return (
                    <div
                      key={`${optionValue}-${index}`}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-2.5 md:py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground touch-manipulation",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4" />}
                      </span>
                      <div className="flex-1">
                        {renderOption
                          ? renderOption(option)
                          : getOptionLabel(option)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };
