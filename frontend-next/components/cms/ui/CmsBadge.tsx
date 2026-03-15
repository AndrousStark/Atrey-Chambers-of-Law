'use client';

import React from 'react';

type BadgeVariant =
  | 'high'
  | 'medium'
  | 'low'
  | 'active'
  | 'pending'
  | 'overdue'
  | 'success'
  | 'warning'
  | 'info'
  | 'default';

interface CmsBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  high: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  medium: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  low: 'bg-green-50 text-[#28A745] border-[#28A745]',
  active: 'bg-blue-50 text-[#2E5090] border-[#2E5090]',
  pending: 'bg-yellow-50 text-[#FF8C00] border-[#FFC107]',
  overdue: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  success: 'bg-green-50 text-[#28A745] border-[#28A745]',
  warning: 'bg-yellow-50 text-[#FF8C00] border-[#FFC107]',
  info: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  default: 'bg-gray-50 text-[#6C757D] border-[#6C757D]',
};

export default function CmsBadge({
  variant = 'default',
  children,
}: CmsBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}
