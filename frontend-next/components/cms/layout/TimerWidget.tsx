'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cmsTimeEntries, cmsCases } from '@/lib/cms-api';
import type { RunningTimer, ActivityType, Case } from '@/lib/cms-types';
import { ACTIVITY_TYPE_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const TICK_INTERVAL_MS = 1000; // 1 second
const LOCALSTORAGE_KEY = 'atrey_timer_state';

const ACTIVITY_TYPES: ActivityType[] = [
  'Research', 'Drafting', 'CourtAppearance', 'Travel', 'ClientMeeting',
  'PhoneCall', 'ReviewWork', 'FilingWork', 'Administrative', 'Consultation',
  'Conference', 'Other',
];

// ============================================================
// Types
// ============================================================

interface CachedTimerState {
  readonly id: string;
  readonly caseId: string | null;
  readonly caseName: string | null;
  readonly activityType: ActivityType;
  readonly description: string | null;
  readonly startedAt: string;
  readonly isPaused: boolean;
  readonly accumulatedMs: number;
}

// ============================================================
// Helpers
// ============================================================

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDurationShort(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function loadCachedState(): CachedTimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCachedState(state: CachedTimerState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

function clearCachedState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch {
    // silently fail
  }
}

function computeElapsedMs(timer: CachedTimerState): number {
  if (timer.isPaused) {
    return timer.accumulatedMs;
  }
  const now = Date.now();
  const started = new Date(timer.startedAt).getTime();
  return now - started + timer.accumulatedMs;
}

// ============================================================
// TimerWidget Component
// ============================================================

export default function TimerWidget() {
  // --- State ---
  const [timer, setTimer] = useState<CachedTimerState | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- New timer form ---
  const [newCaseId, setNewCaseId] = useState('');
  const [newActivityType, setNewActivityType] = useState<ActivityType>('Research');
  const [newDescription, setNewDescription] = useState('');
  const [caseList, setCaseList] = useState<{ id: string; caseNo: string; caseTitle: string }[]>([]);
  const [casesLoaded, setCasesLoaded] = useState(false);

  // --- Refs ---
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // On Mount: Sync with server
  // ============================================================

  useEffect(() => {
    const syncTimer = async () => {
      try {
        const serverTimer = await cmsTimeEntries.timerStatus();

        if (serverTimer) {
          const cached: CachedTimerState = {
            id: serverTimer.id,
            caseId: serverTimer.caseId,
            caseName: serverTimer.case?.caseNo || null,
            activityType: serverTimer.activityType,
            description: serverTimer.description || null,
            startedAt: serverTimer.startedAt,
            isPaused: serverTimer.isPaused,
            accumulatedMs: serverTimer.accumulatedMs,
          };
          setTimer(cached);
          saveCachedState(cached);
        } else {
          // No server timer, check localStorage
          const cachedState = loadCachedState();
          if (cachedState) {
            // Server has no timer but cache does -- orphaned cache, clear it
            clearCachedState();
          }
          setTimer(null);
        }
      } catch {
        // Fall back to localStorage cache
        const cachedState = loadCachedState();
        if (cachedState) {
          setTimer(cachedState);
        }
      }
    };

    syncTimer();
  }, []);

  // ============================================================
  // Tick: update elapsed every second
  // ============================================================

  useEffect(() => {
    if (timer && !timer.isPaused) {
      const tick = () => {
        setElapsedMs(computeElapsedMs(timer));
      };
      tick(); // immediate
      tickRef.current = setInterval(tick, TICK_INTERVAL_MS);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    } else if (timer && timer.isPaused) {
      setElapsedMs(timer.accumulatedMs);
    } else {
      setElapsedMs(0);
    }
  }, [timer]);

  // ============================================================
  // Heartbeat: sync with server every 5 min
  // ============================================================

  useEffect(() => {
    if (!timer) {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      return;
    }

    const doHeartbeat = async () => {
      try {
        const result = await cmsTimeEntries.timerHeartbeat();
        if (result) {
          const updated: CachedTimerState = {
            ...timer,
            isPaused: result.isPaused,
            accumulatedMs: result.accumulatedMs,
            startedAt: result.startedAt,
          };
          setTimer(updated);
          saveCachedState(updated);
        } else {
          // Timer ended on server side
          setTimer(null);
          clearCachedState();
        }
      } catch {
        // silently fail heartbeat
      }
    };

    heartbeatRef.current = setInterval(doHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [timer]);

  // ============================================================
  // Load cases when dropdown opens (lazy)
  // ============================================================

  useEffect(() => {
    if (isOpen && !casesLoaded) {
      const loadCases = async () => {
        try {
          const result = await cmsCases.list({ limit: 500 });
          const items = result.data || [];
          setCaseList(items.map((c: Case) => ({ id: c.id, caseNo: c.caseNo, caseTitle: c.caseTitle })));
          setCasesLoaded(true);
        } catch {
          // silently fail
        }
      };
      loadCases();
    }
  }, [isOpen, casesLoaded]);

  // ============================================================
  // Click outside to close
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
        setDiscardConfirm(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setDiscardConfirm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // ============================================================
  // Toast auto-dismiss
  // ============================================================

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  // ============================================================
  // Handlers
  // ============================================================

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setDiscardConfirm(false);
  }, []);

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    try {
      const result = await cmsTimeEntries.timerStart({
        caseId: newCaseId || undefined,
        activityType: newActivityType,
        description: newDescription.trim() || undefined,
      });

      const caseName = result.case?.caseNo || null;
      const cached: CachedTimerState = {
        id: result.id,
        caseId: result.caseId,
        caseName,
        activityType: result.activityType,
        description: result.description || null,
        startedAt: result.startedAt,
        isPaused: result.isPaused,
        accumulatedMs: result.accumulatedMs,
      };
      setTimer(cached);
      saveCachedState(cached);

      // Reset form
      setNewCaseId('');
      setNewActivityType('Research');
      setNewDescription('');
      setToastMessage('Timer started');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to start timer');
    } finally {
      setIsStarting(false);
    }
  }, [newCaseId, newActivityType, newDescription]);

  const handleStop = useCallback(async () => {
    if (!timer) return;
    setIsStopping(true);
    try {
      const result = await cmsTimeEntries.timerStop(timer.description || undefined);
      setTimer(null);
      clearCachedState();
      setIsOpen(false);
      setToastMessage(`Timer stopped: ${formatDurationShort(result.durationMinutes * 60000)} logged`);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to stop timer');
    } finally {
      setIsStopping(false);
    }
  }, [timer]);

  const handlePause = useCallback(async () => {
    if (!timer || timer.isPaused) return;
    try {
      const result = await cmsTimeEntries.timerPause();
      const updated: CachedTimerState = {
        ...timer,
        isPaused: true,
        accumulatedMs: result.accumulatedMs,
      };
      setTimer(updated);
      saveCachedState(updated);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to pause timer');
    }
  }, [timer]);

  const handleResume = useCallback(async () => {
    if (!timer || !timer.isPaused) return;
    try {
      const result = await cmsTimeEntries.timerResume();
      const updated: CachedTimerState = {
        ...timer,
        isPaused: false,
        startedAt: result.startedAt,
        accumulatedMs: result.accumulatedMs,
      };
      setTimer(updated);
      saveCachedState(updated);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to resume timer');
    }
  }, [timer]);

  const handleDiscard = useCallback(async () => {
    if (!timer) return;
    try {
      await cmsTimeEntries.timerDiscard();
      setTimer(null);
      clearCachedState();
      setIsOpen(false);
      setDiscardConfirm(false);
      setToastMessage('Timer discarded');
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to discard timer');
    }
  }, [timer]);

  // ============================================================
  // Render helpers
  // ============================================================

  const isRunning = timer !== null && !timer.isPaused;
  const isPaused = timer !== null && timer.isPaused;
  const isIdle = timer === null;

  const SELECT_CLASS =
    'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8';

  const SELECT_STYLE = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 10px center' as const,
  };

  const INPUT_CLASS =
    'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors';

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="relative" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Timer Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`relative flex items-center gap-1.5 px-2 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
          isIdle
            ? 'hover:bg-white/10'
            : isRunning
              ? 'bg-[#28A745]/20 hover:bg-[#28A745]/30'
              : 'bg-[#D97706]/20 hover:bg-[#D97706]/30'
        }`}
        aria-label={isIdle ? 'Start timer' : `Timer: ${formatElapsed(elapsedMs)}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Clock icon or pulsing dot */}
        {isIdle ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ) : (
          <>
            {/* Pulsing dot */}
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: isRunning ? '#28A745' : '#D97706' }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: isRunning ? '#28A745' : '#D97706' }}
              />
            </span>

            {/* Time display */}
            <span className="text-white text-xs font-mono font-semibold tracking-wide hidden sm:inline">
              {formatElapsed(elapsedMs)}
            </span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          role="menu"
        >
          {/* Running / Paused State */}
          {!isIdle && timer && (
            <div className="p-4">
              {/* Elapsed time (large) */}
              <div className="text-center mb-3">
                <p
                  className="text-3xl font-mono font-bold tracking-wider"
                  style={{ color: isRunning ? '#28A745' : '#D97706' }}
                >
                  {formatElapsed(elapsedMs)}
                </p>
                <p className="text-xs text-[#6C757D] mt-1">
                  {isPaused ? 'Paused' : 'Running'}
                </p>
              </div>

              {/* Timer details */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1.5">
                {timer.caseName && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-[#4472C4]">{timer.caseName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-xs text-[#333]">{ACTIVITY_TYPE_LABELS[timer.activityType]}</span>
                </div>
                {timer.description && (
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                      <line x1="17" y1="10" x2="3" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                    <span className="text-xs text-[#666] leading-relaxed">{timer.description}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Pause / Resume */}
                {isRunning ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 h-9 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 text-[#D97706] border-[#D97706]/30 bg-amber-50 hover:bg-amber-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex-1 h-9 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 text-[#28A745] border-[#28A745]/30 bg-green-50 hover:bg-green-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Resume
                  </button>
                )}

                {/* Stop */}
                <button
                  onClick={handleStop}
                  disabled={isStopping}
                  className="flex-1 h-9 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 text-white bg-[#FF4444] border-[#FF4444] hover:bg-[#E63939] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStopping ? (
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                    </svg>
                  )}
                  Stop
                </button>
              </div>

              {/* Discard (small) */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                {discardConfirm ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-[#FF4444]">Discard timer?</span>
                    <button
                      onClick={handleDiscard}
                      className="text-xs font-medium text-[#FF4444] hover:underline"
                    >
                      Yes, discard
                    </button>
                    <span className="text-xs text-[#CCC]">|</span>
                    <button
                      onClick={() => setDiscardConfirm(false)}
                      className="text-xs font-medium text-[#6C757D] hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDiscardConfirm(true)}
                    className="text-xs text-[#6C757D] hover:text-[#FF4444] transition-colors"
                  >
                    Discard timer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Idle State: Start New Timer */}
          {isIdle && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Start Timer</h3>

              <div className="space-y-3">
                {/* Case */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
                    Case (optional)
                  </label>
                  <select
                    value={newCaseId}
                    onChange={(e) => setNewCaseId(e.target.value)}
                    className={SELECT_CLASS}
                    style={SELECT_STYLE}
                  >
                    <option value="">No case</option>
                    {caseList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity type */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
                    Activity
                  </label>
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                    className={SELECT_CLASS}
                    style={SELECT_STYLE}
                  >
                    {ACTIVITY_TYPES.map((a) => (
                      <option key={a} value={a}>{ACTIVITY_TYPE_LABELS[a]}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className={INPUT_CLASS}
                  />
                </div>

                {/* Start button */}
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full h-10 rounded-md text-sm font-semibold text-white bg-[#28A745] border border-[#28A745] hover:bg-[#22963E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isStarting ? (
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                  Start Timer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border bg-green-50 border-[#28A745]/30 text-sm font-medium text-[#28A745]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="flex-1">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-0.5 rounded hover:bg-black/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <style>{`
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.25s ease-out; }
          `}</style>
        </div>
      )}
    </div>
  );
}
