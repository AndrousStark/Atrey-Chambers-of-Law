'use client';

import { useState, useCallback } from 'react';

interface CmsDatePickerProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly disabled?: boolean;
  readonly error?: string;
}

const DD_MM_YYYY_REGEX = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;

function validateDateFormat(input: string): string {
  if (!input) return '';
  if (!DD_MM_YYYY_REGEX.test(input)) {
    return 'Invalid date format. Use DD.MM.YYYY';
  }
  return '';
}

export default function CmsDatePicker({
  value,
  onChange,
  placeholder = 'DD.MM.YYYY',
  label,
  disabled = false,
  error: externalError,
}: CmsDatePickerProps) {
  const [internalError, setInternalError] = useState('');

  const displayError = externalError || internalError;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      if (internalError) {
        setInternalError('');
      }
    },
    [onChange, internalError]
  );

  const handleBlur = useCallback(() => {
    if (value) {
      const validationError = validateDateFormat(value);
      setInternalError(validationError);
    } else {
      setInternalError('');
    }
  }, [value]);

  const borderColor = displayError ? '#EF4444' : '#D1D5DB';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: '#1B2A4A' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2.5 pr-10 text-sm rounded-md border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor,
            color: '#1B2A4A',
            backgroundColor: disabled ? '#F3F4F6' : '#FFFFFF',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}
        />

        {/* Calendar icon */}
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] pointer-events-none"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {displayError && (
        <p className="text-xs" style={{ color: '#EF4444' }}>
          {displayError}
        </p>
      )}
    </div>
  );
}
