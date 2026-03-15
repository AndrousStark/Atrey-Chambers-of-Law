'use client';

import React from 'react';

interface CmsEmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function CmsEmptyState({
  icon = '📭',
  title,
  subtitle,
}: CmsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4 select-none" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-[#6C757D] max-w-md">{subtitle}</p>
      )}
    </div>
  );
}
