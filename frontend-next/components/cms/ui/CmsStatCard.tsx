'use client';

import React from 'react';

interface CmsStatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  color: string;
  icon?: string;
}

export default function CmsStatCard({
  label,
  value,
  detail,
  color,
  icon,
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
          {icon && (
            <span className="text-2xl ml-3 flex-shrink-0 select-none" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
