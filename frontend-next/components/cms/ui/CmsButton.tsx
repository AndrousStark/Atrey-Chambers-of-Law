'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CmsButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4472C4] text-white border-[#4472C4] hover:bg-[#2E5090] hover:border-[#2E5090]',
  secondary:
    'bg-[#F0F2F5] text-[#1B2A4A] border-[#1B2A4A] hover:bg-[#D6E4F0]',
  danger:
    'bg-white text-[#FF4444] border-[#FF4444] hover:bg-red-50',
  success:
    'bg-white text-[#28A745] border-[#28A745] hover:bg-green-50',
  warning:
    'bg-white text-[#FF8C00] border-[#FF8C00] hover:bg-orange-50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

function Spinner({ size }: { size: ButtonSize }) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <svg
      className={`animate-spin ${sizeClass} mr-2`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function CmsButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: CmsButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg border
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4472C4]
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim()}
    >
      {loading && <Spinner size={size} />}
      {children}
    </button>
  );
}
