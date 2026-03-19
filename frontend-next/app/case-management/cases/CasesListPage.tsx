'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { cmsCases, cmsAuth } from '@/lib/cms-api';
import type { Case, CaseFilters as CaseFiltersType, CaseStatus, UserRole } from '@/lib/cms-types';
import { CASE_STATUS_LABELS } from '@/lib/cms-types';
import CaseFiltersBar from '@/components/cms/cases/CaseFilters';
import CaseTable from '@/components/cms/cases/CaseTable';
import { DEFAULT_VISIBLE_COLUMNS, TOGGLEABLE_COLUMNS } from '@/components/cms/cases/CaseTable';
import CasePagination from '@/components/cms/cases/CasePagination';
import AddCaseModal from '@/components/cms/cases/AddCaseModal';
import { CmsToastProvider, useToast, CmsConfirmDialog } from '@/components/cms/ui';
import dynamic from 'next/dynamic';

// Lazy-load case detail view (used when ?view=CASE_ID is in URL)
const CaseDetailView = dynamic(
  () => import('@/components/cms/cases/CaseDetailView'),
  { ssr: false, loading: () => <div className="animate-pulse p-12 text-center text-sm text-gray-400">Loading case details...</div> }
);

// --- Bulk Actions Bar ---

function BulkActionsBar({
  selectedCount,
  userRole,
  onBulkStatusUpdate,
  onBulkDelete,
  onClearSelection,
}: {
  readonly selectedCount: number;
  readonly userRole: UserRole;
  readonly onBulkStatusUpdate: (status: CaseStatus) => void;
  readonly onBulkDelete: () => void;
  readonly onClearSelection: () => void;
}) {
  const [bulkStatus, setBulkStatus] = useState<string>('');

  if (selectedCount === 0) return null;

  return (
    <div className="bg-[#1B2A4A] rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 text-white shadow-lg">
      <span className="text-sm font-medium">
        {selectedCount} case{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="h-5 w-px bg-white/20" />

      {/* Bulk status update */}
      <div className="flex items-center gap-2">
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
          className="
            h-8 px-2 pr-6 rounded-md border border-white/30 bg-white/10
            text-sm text-white appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-white/30
          "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
          }}
        >
          <option value="">Set Status...</option>
          {(Object.entries(CASE_STATUS_LABELS) as [CaseStatus, string][]).map(([value, label]) => (
            <option key={value} value={value} className="text-[#333]">{label}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (bulkStatus) {
              onBulkStatusUpdate(bulkStatus as CaseStatus);
              setBulkStatus('');
            }
          }}
          disabled={!bulkStatus}
          className="
            h-8 px-3 rounded-md text-xs font-medium bg-[#4472C4] border border-[#4472C4]
            hover:bg-[#3A62A8] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          Apply
        </button>
      </div>

      {/* Bulk delete (admin only) */}
      {userRole === 'superadmin' && (
        <>
          <div className="h-5 w-px bg-white/20" />
          <button
            onClick={onBulkDelete}
            className="h-8 px-3 rounded-md text-xs font-medium bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors"
          >
            Delete Selected
          </button>
        </>
      )}

      <div className="flex-1" />

      <button
        onClick={onClearSelection}
        className="text-xs text-white/70 hover:text-white transition-colors"
      >
        Clear selection
      </button>
    </div>
  );
}

// --- Column Visibility Dropdown ---

function ColumnVisibilityDropdown({
  visibleColumns,
  onVisibleColumnsChange,
}: {
  readonly visibleColumns: string[];
  readonly onVisibleColumnsChange: (columns: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const visibleSet = new Set(visibleColumns);

  const handleToggle = (key: string) => {
    const next = new Set(visibleSet);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onVisibleColumnsChange(Array.from(next));
  };

  const handleShowAll = () => {
    onVisibleColumnsChange(TOGGLEABLE_COLUMNS.map((c) => c.key));
  };

  const handleResetDefault = () => {
    // Default columns without checkbox and actions (those are always shown)
    onVisibleColumnsChange([...DEFAULT_VISIBLE_COLUMNS].filter((k) => k !== 'checkbox' && k !== 'actions'));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          h-9 px-4 rounded-md text-sm font-medium
          border transition-colors flex items-center gap-2
          ${isOpen
            ? 'text-[#4472C4] border-[#4472C4] bg-blue-50'
            : 'text-[#6C757D] border-gray-300 bg-white hover:bg-gray-50'
          }
        `}
        title="Toggle column visibility"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg border border-gray-200 shadow-xl z-50">
          {/* Header actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider">Columns</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShowAll}
                className="text-[10px] font-medium text-[#4472C4] hover:underline"
              >
                Show All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleResetDefault}
                className="text-[10px] font-medium text-[#4472C4] hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Column checkboxes */}
          <div className="max-h-72 overflow-y-auto py-1">
            {TOGGLEABLE_COLUMNS.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleSet.has(col.key)}
                  onChange={() => handleToggle(col.key)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                />
                <span className="text-sm text-[#333333]">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function AllCasesPage() {
  // Check if viewing a specific case via ?view=CASE_ID
  const searchParams = useSearchParams();
  const viewCaseId = searchParams.get('view');

  // If ?view=CASE_ID is present, render the case detail view
  if (viewCaseId) {
    return <CaseDetailView />;
  }

  return (
    <CmsToastProvider>
      <CaseListView />
    </CmsToastProvider>
  );
}

function CaseListView() {
  // State
  const [cases, setCases] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CaseFiltersType>({
    page: 1,
    limit: 25,
    sortBy: 'serialNo',
    sortOrder: 'asc',
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // Edit Mode
  const [editMode, setEditMode] = useState(false);

  // Column Visibility — store only the toggleable column keys (exclude checkbox/actions)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    () => [...DEFAULT_VISIBLE_COLUMNS].filter((k) => k !== 'checkbox' && k !== 'actions')
  );

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Toast (shared provider)
  const { showToast } = useToast();

  // --- Data fetching ---

  const fetchCases = useCallback(async (currentFilters: CaseFiltersType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cmsCases.list(currentFilters);
      setCases(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases.');
      setCases([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases(filters);
  }, [filters, fetchCases]);

  // Get user role
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  // --- Handlers ---

  const handleFiltersChange = useCallback((newFilters: CaseFiltersType) => {
    setFilters(newFilters);
    setSelectedIds(new Set());
  }, []);

  const handleSort = useCallback((key: string) => {
    setFilters((prev) => {
      const isSameKey = prev.sortBy === key;
      return {
        ...prev,
        sortBy: key,
        sortOrder: isSameKey && prev.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      };
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedIds(new Set());
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
    setSelectedIds(new Set());
  }, []);

  // Selection
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allCurrentIds = cases.map((c) => c.id);
      const allSelected = allCurrentIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(allCurrentIds);
    });
  }, [cases]);

  // Add case
  const handleAddCase = useCallback(async (data: Partial<Case>) => {
    await cmsCases.create(data);
    showToast('success', 'Case created successfully.');
    await fetchCases(filters);
  }, [filters, fetchCases, showToast]);

  // Edit case
  const handleEditCase = useCallback(async (data: Partial<Case>) => {
    if (!editCase) return;
    await cmsCases.update(editCase.id, data);
    showToast('success', 'Case updated successfully.');
    setEditCase(null);
    await fetchCases(filters);
  }, [editCase, filters, fetchCases, showToast]);

  // Delete case
  const handleDeleteCase = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsCases.remove(deleteTarget.id);
      showToast('success', `Case "${deleteTarget.caseNo}" deleted.`);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await fetchCases(filters);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete case.');
    }
  }, [deleteTarget, filters, fetchCases, showToast]);

  // Inline update (for edit mode)
  const handleInlineUpdate = useCallback(async (id: string, data: Partial<Case>): Promise<boolean> => {
    try {
      await cmsCases.update(id, data);
      // Update local state immutably so UI reflects the change without re-fetching
      setCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
      );
      return true;
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save inline edit.');
      return false;
    }
  }, [showToast]);

  // Bulk status update
  const handleBulkStatusUpdate = useCallback(async (status: CaseStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await cmsCases.bulkUpdate(ids, { status });
      showToast('success', `Updated status to "${CASE_STATUS_LABELS[status]}" for ${ids.length} case(s).`);
      setSelectedIds(new Set());
      await fetchCases(filters);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Bulk update failed.');
    }
  }, [selectedIds, filters, fetchCases, showToast]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await cmsCases.remove(id);
      }
      showToast('success', `Deleted ${ids.length} case(s).`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      await fetchCases(filters);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Bulk delete failed.');
    }
  }, [selectedIds, filters, fetchCases, showToast]);

  // --- Render ---

  const canEdit = userRole === 'superadmin' || userRole === 'editor';

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">All Cases</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Master register of all cases &mdash;{' '}
            {loading ? 'loading...' : `${total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCases(filters)}
            disabled={loading}
            className="
              h-9 px-4 rounded-md text-sm font-medium
              text-[#6C757D] border border-gray-300 bg-white
              hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
            title="Refresh data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          {/* Column Visibility Toggle */}
          <ColumnVisibilityDropdown
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />

          {/* Edit Mode Toggle */}
          {canEdit && (
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className={`
                h-9 px-4 rounded-md text-sm font-medium
                border transition-colors flex items-center gap-2
                ${editMode
                  ? 'text-white bg-[#4472C4] border-[#4472C4] hover:bg-[#3A62A8]'
                  : 'text-[#6C757D] border-gray-300 bg-white hover:bg-gray-50'
                }
              `}
              title={editMode ? 'Exit inline editing mode' : 'Enter inline editing mode'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </button>
          )}

          {/* Add Case */}
          {canEdit && (
            <button
              onClick={() => {
                setEditCase(null);
                setAddModalOpen(true);
              }}
              className="
                h-9 px-5 rounded-md text-sm font-medium
                text-white bg-[#4472C4] border border-[#4472C4]
                hover:bg-[#3A62A8] transition-colors
                flex items-center gap-2
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Case
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode && (
        <div className="bg-blue-50 border border-[#4472C4]/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm text-[#4472C4]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="font-medium">Edit Mode is ON</span>
          <span className="text-[#4472C4]/70">&mdash; Click on Status, Priority, NDOH, or Remarks cells to edit inline. Changes save automatically.</span>
        </div>
      )}

      {/* Filters */}
      <CaseFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        userRole={userRole}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button
            onClick={() => fetchCases(filters)}
            className="ml-auto text-xs font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#4472C4', borderTopColor: 'transparent', borderWidth: '3px' }}
          />
          <p className="text-sm text-[#6C757D]">Loading cases...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <CaseTable
          cases={cases}
          sortBy={filters.sortBy || 'serialNo'}
          sortOrder={filters.sortOrder || 'asc'}
          onSort={handleSort}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onEdit={(c) => setEditCase(c)}
          onDelete={(c) => setDeleteTarget(c)}
          userRole={userRole}
          editMode={editMode}
          onInlineUpdate={handleInlineUpdate}
          visibleColumns={visibleColumns}
        />
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <CasePagination
          page={filters.page || 1}
          totalPages={totalPages}
          total={total}
          limit={filters.limit || 25}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Add Case Modal */}
      <AddCaseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddCase}
      />

      {/* Edit Case Modal */}
      {editCase && (
        <AddCaseModal
          isOpen={true}
          onClose={() => setEditCase(null)}
          onSave={handleEditCase}
          initialData={editCase}
        />
      )}

      {/* Delete Confirmation */}
      <CmsConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Case"
        message={`Are you sure you want to delete "${deleteTarget?.caseNo}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteCase}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirmation */}
      <CmsConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Selected Cases"
        message={`Are you sure you want to delete ${selectedIds.size} selected case(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} case(s)`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
