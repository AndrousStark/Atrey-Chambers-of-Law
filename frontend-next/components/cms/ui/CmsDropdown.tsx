'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CmsDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function CmsDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
}: CmsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleToggleOption = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(next);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={containerRef} className="relative inline-block min-w-[180px]">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2 text-sm text-left
          bg-white border border-gray-300 rounded-lg
          hover:border-[#4472C4] transition-colors
          focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-[#4472C4]
          ${isOpen ? 'ring-2 ring-[#4472C4] border-[#4472C4]' : ''}
        `.trim()}
      >
        <span className="truncate text-[#333333]">
          {selected.length === 0
            ? placeholder
            : selected.length === 1
              ? selected[0]
              : `${selected.length} selected`}
        </span>
        <span className="flex items-center gap-1 ml-2 flex-shrink-0">
          {selected.length > 0 && (
            <span
              onClick={handleClear}
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#4472C4] text-white text-[10px] font-bold cursor-pointer hover:bg-[#2E5090]"
              title="Clear selection"
            >
              {selected.length}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[#6C757D] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-[#6C757D]">No options</div>
          ) : (
            options.map((option) => {
              const isChecked = selected.includes(option);
              return (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#333333] hover:bg-[#F0F2F5] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleOption(option)}
                    className="rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4]"
                  />
                  <span className="truncate">{option}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
