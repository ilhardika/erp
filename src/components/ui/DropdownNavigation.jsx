import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../../lib/utils";

const DropdownNavigation = ({
  title,
  items = [],
  className = "",
  activeColor = "text-gray-900 border-b-2 border-gray-900",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Check if any item in dropdown is active
  const isGroupActive = items.some(
    (item) =>
      item.href === location.pathname ||
      (item.href !== "/" && location.pathname.startsWith(item.href))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-1 text-sm font-medium transition-colors pb-1",
          isGroupActive ? activeColor : "text-gray-600 hover:text-gray-900"
        )}
      >
        <span>{title}</span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {items.map((item, index) => {
              const isActive =
                item.href === location.pathname ||
                (item.href !== "/" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-gray-50 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNavigation;
