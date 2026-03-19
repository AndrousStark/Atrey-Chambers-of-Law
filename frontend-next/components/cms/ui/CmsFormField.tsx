'use client';

import React from 'react';
import { tw, selectArrowStyle } from '@/lib/design-tokens';

// ─── Text Input ──────────────────────────────────────────────

interface CmsInputProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password' | 'url';
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url';
  readonly className?: string;
}

export function CmsInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  error,
  inputMode,
  className = '',
}: CmsInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={tw.label}>
        {label}
        {required && <span className="text-[#FF4444] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        inputMode={inputMode}
        className={`${tw.input} ${error ? 'border-[#FF4444] focus:border-[#FF4444] focus:ring-[#FF4444]/30' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      />
      {error && <p className="text-xs text-[#FF4444]">{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────

interface CmsSelectProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly className?: string;
}

export function CmsSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  error,
  className = '',
}: CmsSelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={tw.label}>
        {label}
        {required && <span className="text-[#FF4444] ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`${tw.select} ${error ? 'border-[#FF4444]' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
        style={selectArrowStyle}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#FF4444]">{error}</p>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────

interface CmsTextareaProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly className?: string;
}

export function CmsTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  error,
  className = '',
}: CmsTextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={tw.label}>
        {label}
        {required && <span className="text-[#FF4444] ml-0.5">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`${tw.textarea} ${error ? 'border-[#FF4444]' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      />
      {error && <p className="text-xs text-[#FF4444]">{error}</p>}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────

interface CmsToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function CmsToggle({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}: CmsToggleProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-[#28A745]' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm text-[#333333]">{label}</span>
    </div>
  );
}
