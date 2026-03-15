'use client';

import React from 'react';

interface CmsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CmsSearch({
  value,
  onChange,
  placeholder = 'Search...',
}: CmsSearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      {/* Magnifying glass icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D] pointer-events-none"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-4 py-2 text-sm
          bg-white border border-gray-300 rounded-lg
          text-[#333333] placeholder-[#6C757D]
          transition-all
          focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-[#4472C4]
          hover:border-[#4472C4]
        "
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#333333] transition-colors"
          aria-label="Clear search"
        >
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
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
