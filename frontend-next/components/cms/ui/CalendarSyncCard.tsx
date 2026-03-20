'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCw, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { cmsCalendar } from '@/lib/cms-api';

export default function CalendarSyncCard() {
  const [feedToken, setFeedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    try {
      const { token } = await cmsCalendar.getFeedToken();
      setFeedToken(token);
    } catch {
      // Token will be null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  const feedUrl = feedToken ? cmsCalendar.feedUrl(feedToken) : '';
  const googleUrl = feedToken ? cmsCalendar.googleSubscribeUrl(feedUrl) : '';

  const handleCopy = useCallback(async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = feedUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [feedUrl]);

  const handleRegenerate = useCallback(async () => {
    if (!confirm('This will invalidate your current calendar subscription. You will need to re-subscribe. Continue?')) return;
    setRegenerating(true);
    try {
      const { token } = await cmsCalendar.regenerateToken();
      setFeedToken(token);
    } catch {
      // Keep old token
    } finally {
      setRegenerating(false);
    }
  }, []);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#4472C4]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4472C4]/10 flex items-center justify-center">
            <Calendar size={20} className="text-[#4472C4]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1B2A4A]">Calendar Sync</h3>
            <p className="text-xs text-[#6C757D]">
              Sync all court hearing dates to your calendar automatically
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        ) : (
          <>
            {/* Google Calendar — One Click */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-2">
                Google Calendar (Recommended)
              </p>
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ backgroundColor: '#4285F4' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3367D6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4285F4'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2"/>
                  <path d="M3 10h18" stroke="white" strokeWidth="2"/>
                  <path d="M8 4V2M16 4V2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="15" r="1.5" fill="white"/>
                </svg>
                Subscribe in Google Calendar
                <ExternalLink size={14} />
              </a>
              <p className="text-[10px] text-[#6C757D] mt-1.5">
                One-click subscribe — all hearings sync automatically. Updates every few hours.
              </p>
            </div>

            {/* Outlook / Apple — Manual */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-2">
                Outlook / Apple Calendar / Other
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={feedUrl}
                    className="w-full h-9 pl-3 pr-10 rounded-md border border-gray-300 bg-gray-50 text-xs text-[#333] font-mono truncate"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute right-1 top-1 h-7 w-7 rounded flex items-center justify-center text-[#6C757D] hover:text-[#4472C4] hover:bg-[#4472C4]/10 transition-colors cursor-pointer"
                    title={copied ? 'Copied!' : 'Copy URL'}
                  >
                    {copied ? <Check size={14} className="text-[#28A745]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#6C757D] mt-1.5">
                Copy this URL → In Outlook: Add Calendar → From Internet → Paste URL.
                In Apple Calendar: File → New Subscription → Paste URL.
              </p>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFF8EB] border border-[#FF8C00]/20">
              <Smartphone size={16} className="text-[#FF8C00] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#6C757D]">
                <span className="font-semibold text-[#333]">Mobile:</span>{' '}
                Open the Google Calendar link above on your phone to add all hearings to your mobile calendar with push reminders 1 day and 3 days before each hearing.
              </p>
            </div>

            {/* Regenerate Token */}
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 text-xs text-[#6C757D] hover:text-[#FF4444] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Regenerating...' : 'Regenerate feed URL (invalidates current subscription)'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
