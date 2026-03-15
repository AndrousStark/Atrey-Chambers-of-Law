'use client';

import React from 'react';

interface DistributionChartsProps {
  courtDistribution: { court: string; count: number }[];
  departmentDistribution: { department: string; count: number }[];
}

function HorizontalBar({
  label,
  count,
  maxCount,
  color,
}: {
  label: string;
  count: number;
  maxCount: number;
  color: string;
}) {
  const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs truncate mr-2" style={{ color: '#333', maxWidth: '70%' }}>
          {label}
        </span>
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#1B2A4A' }}>
          {count}
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#E8ECF1' }}>
        <div
          className="h-2 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: color,
            minWidth: count > 0 ? '4px' : '0px',
          }}
        />
      </div>
    </div>
  );
}

export default function DistributionCharts({
  courtDistribution,
  departmentDistribution,
}: DistributionChartsProps) {
  const courtMax = courtDistribution.length > 0
    ? Math.max(...courtDistribution.map((c) => c.count))
    : 0;

  const deptMax = departmentDistribution.length > 0
    ? Math.max(...departmentDistribution.map((d) => d.count))
    : 0;

  const sortedCourts = [...courtDistribution].sort((a, b) => b.count - a.count);
  const sortedDepts = [...departmentDistribution].sort((a, b) => b.count - a.count);

  const hasData = courtDistribution.length > 0 || departmentDistribution.length > 0;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#1B2A4A' }}>
          Distribution
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        {!hasData ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#6C757D' }}>
              No distribution data available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* By Court */}
            {sortedCourts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6C757D' }}>
                  By Court
                </h4>
                {sortedCourts.map((item) => (
                  <HorizontalBar
                    key={item.court}
                    label={item.court}
                    count={item.count}
                    maxCount={courtMax}
                    color="#4472C4"
                  />
                ))}
              </div>
            )}

            {/* By Department */}
            {sortedDepts.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6C757D' }}>
                  By Department
                </h4>
                {sortedDepts.map((item) => (
                  <HorizontalBar
                    key={item.department}
                    label={item.department}
                    count={item.count}
                    maxCount={deptMax}
                    color="#4472C4"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
