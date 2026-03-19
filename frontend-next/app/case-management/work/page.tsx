'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TasksPage = dynamic(() => import('../tasks/page'), {
  loading: () => (
    <div className="animate-pulse p-6 space-y-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 h-96" />
    </div>
  ),
});

export default function WorkPage() {
  return <TasksPage />;
}
