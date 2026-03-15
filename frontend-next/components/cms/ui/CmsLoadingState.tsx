'use client';

import React from 'react';

interface CmsLoadingStateProps {
  text?: string;
}

export default function CmsLoadingState({
  text = 'Loading...',
}: CmsLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-10 h-10 mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#D6E4F0]" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#4472C4] animate-spin" />
      </div>
      {text && (
        <p className="text-sm text-[#6C757D] font-medium">{text}</p>
      )}
    </div>
  );
}
