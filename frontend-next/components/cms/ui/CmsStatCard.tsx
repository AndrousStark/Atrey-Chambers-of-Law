'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CmsStatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly detail?: string;
  readonly color: string;
  readonly icon?: LucideIcon;
}

export default function CmsStatCard({
  label,
  value,
  detail,
  color,
  icon: Icon,
}: CmsStatCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-default"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
            {detail && (
              <p className="text-xs text-[#6C757D] mt-1 truncate">{detail}</p>
            )}
          </div>
          {Icon && (
            <div className="ml-3 flex-shrink-0 opacity-40" style={{ color }}>
              <Icon size={28} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
