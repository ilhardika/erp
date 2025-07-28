import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const MultiSelectFilter = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Filter...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate position based on button element with smart left/right positioning
  const getPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 256; // 256px (w-64 equivalent)
    const viewportWidth = window.innerWidth;

    // Check if dropdown would overflow on the right
    const wouldOverflow = rect.left + dropdownWidth > viewportWidth - 20; // 20px buffer

    return {
      top: rect.bottom + window.scrollY + 4, // 4px margin
      left: wouldOverflow
        ? rect.right + window.scrollX - dropdownWidth // Open to the left
        : rect.left + window.scrollX, // Open to the right (default)
    };
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions.map((option) => option.value));
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const selectedOption = options.find((opt) => opt.value === value[0]);
      return selectedOption ? selectedOption.label : value[0];
    }
    return `${value.length} dipilih`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors relative"
        title={`Filter ${placeholder}`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
          />
        </svg>
        {value.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {value.length}
          </span>
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute bg-white border border-gray-300 rounded-md shadow-xl z-[9999] w-64"
            style={{
              top: getPosition().top + "px",
              left: getPosition().left + "px",
              zIndex: 9999,
            }}
          >
            {/* Header dengan Clear All */}
            <div className="flex justify-between items-center mb-2 px-3 pt-3">
              <span className="text-xs font-medium text-[#5f6a70]">
                Pilih Filter
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Hapus Semua
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari..."
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm("");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Options Container with Scroll */}
            <div className="max-h-60 overflow-y-auto">
              {/* Options */}
              <div className="flex flex-col">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleOptionToggle(option.value)}
                    >
                      {/* Custom Checkbox */}
                      <div
                        className={`w-4 h-4 relative rounded flex items-center justify-center ${
                          value.includes(option.value)
                            ? "bg-blue-500"
                            : "border border-gray-300 bg-white"
                        }`}
                      >
                        {value.includes(option.value) && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {/* Option Text */}
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm italic text-gray-500">
                    Tidak ada opsi ditemukan
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MultiSelectFilter;
