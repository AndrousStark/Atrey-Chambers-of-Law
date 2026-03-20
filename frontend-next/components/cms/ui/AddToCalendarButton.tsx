'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { buildGoogleCalendarUrl, buildOutlookCalendarUrl, downloadIcs } from '@/lib/calendar-links';
import type { Case } from '@/lib/cms-types';

interface AddToCalendarButtonProps {
  readonly caseData: Case;
  readonly size?: 'sm' | 'md';
}

export default function AddToCalendarButton({ caseData, size = 'sm' }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  if (!caseData.ndoh) return null;

  const params = {
    caseNo: caseData.caseNo,
    caseTitle: caseData.caseTitle,
    court: caseData.court,
    client: caseData.client,
    ndoh: caseData.ndoh,
    status: caseData.status,
    remarks: caseData.remarks,
    bench: caseData.bench,
    presidingJudge: caseData.presidingJudge,
  };

  const googleUrl = buildGoogleCalendarUrl(params);
  const outlookUrl = buildOutlookCalendarUrl(params);

  const isSmall = size === 'sm';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-md border transition-colors cursor-pointer ${
          isSmall
            ? 'h-7 px-2 text-xs border-[#4472C4]/30 text-[#4472C4] hover:bg-blue-50'
            : 'h-9 px-3 text-sm border-[#4472C4] text-[#4472C4] hover:bg-blue-50'
        }`}
        title="Add to Calendar"
      >
        <Calendar size={isSmall ? 12 : 14} />
        {!isSmall && <span>Calendar</span>}
        <ChevronDown size={isSmall ? 10 : 12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-xl z-50 min-w-[180px] py-1">
          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#333] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#4285F4" strokeWidth="2"/>
                <path d="M2 9h20" stroke="#4285F4" strokeWidth="2"/>
                <path d="M8 3v3M16 3v3" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Google Calendar
            </a>
          )}
          {outlookUrl && (
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#333] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#0078D4" strokeWidth="2"/>
                <path d="M2 9h20" stroke="#0078D4" strokeWidth="2"/>
                <path d="M8 3v3M16 3v3" stroke="#0078D4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Outlook Calendar
            </a>
          )}
          <button
            onClick={() => { downloadIcs(params); setOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#333] hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download .ics
          </button>
        </div>
      )}
    </div>
  );
}
