'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CmsEmptyStateProps {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: React.ReactNode;
}

export default function CmsEmptyState({
  icon: Icon = Inbox,
  title,
  subtitle,
  action,
}: CmsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#6C757D]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-[#6C757D] max-w-md">{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
