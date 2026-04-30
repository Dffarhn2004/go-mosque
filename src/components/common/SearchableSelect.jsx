import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  getOptionLabel = (option) => option.label || option,
  getOptionValue = (option) => option.value || option,
  error = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase();
    const search = searchTerm.toLowerCase();
    return label.includes(search);
  });

  // Get selected option
  const selectedOption = options.find(
    (option) => getOptionValue(option) === value
  );

  // Close modal when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white text-left flex items-center justify-between ${
          error ? "border-red-500" : "border-gray-300"
        } ${isOpen ? "ring-2 ring-green-500 border-transparent" : ""}`}
      >
        <span
          className={`truncate ${selectedOption ? "text-gray-900" : "text-gray-500"}`}
        >
          {selectedOption
            ? getOptionLabel(selectedOption)
            : placeholder}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pilih {placeholder.replace("...", "")}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm("");
                    setHighlightedIndex(-1);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Options List */}
              <div
                ref={dropdownRef}
                className="overflow-y-auto flex-1"
                style={{ maxHeight: "calc(80vh - 140px)" }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-gray-500 text-center">
                    Tidak ada hasil ditemukan
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredOptions.map((option, index) => {
                      const optionValue = getOptionValue(option);
                      const optionLabel = getOptionLabel(option);
                      const isSelected = value === optionValue;
                      const isHighlighted = index === highlightedIndex;

                      return (
                        <button
                          key={optionValue}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors rounded-lg ${
                            isSelected
                              ? "bg-green-50 text-gray-900 font-medium border-2 border-green-500"
                              : isHighlighted
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-900 hover:bg-gray-50"
                          }`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          {optionLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              {filteredOptions.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    {filteredOptions.length} hasil ditemukan • Gunakan ↑↓ untuk navigasi, Enter untuk memilih, Esc untuk menutup
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchableSelect;

