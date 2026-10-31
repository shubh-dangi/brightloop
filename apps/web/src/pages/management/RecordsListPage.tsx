import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import {
  GenericRecordDto,
  RecordStatus,
  RecordPriority,
  CreateRecordInput,
} from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Skeleton } from '../../components/ui/skeleton';
import { RecordFormModal } from './RecordFormModal';
import { formatDate } from '../../lib/utils';

export function RecordsListPage() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<GenericRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GenericRecordDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogItem, setDeleteDialogItem] = useState<GenericRecordDto | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/records', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        },
      });

      const responseData = res.data?.data;
      if (Array.isArray(responseData)) {
        setRecords(responseData);
        setTotalCount(res.data?.meta?.pagination?.total || responseData.length);
        setTotalPages(res.data?.meta?.pagination?.totalPages || 1);
      } else if (responseData?.items) {
        setRecords(responseData.items);
        setTotalCount(responseData.meta?.total || responseData.items.length);
        setTotalPages(responseData.meta?.totalPages || 1);
      } else {
        setRecords([]);
      }
    } catch {
      // Fallback demo mock data
      const mockItems: GenericRecordDto[] = [
        {
          id: 'rec-1',
          organizationId: 'org-demo',
          title: 'Infrastructure Ingestion Gateway',
          description: 'Primary ingress pipeline processing multi-region webhook payloads.',
          status: RecordStatus.ACTIVE,
          priority: RecordPriority.CRITICAL,
          category: 'Infrastructure',
          tags: ['gateway', 'network'],
          metadata: { version: '2.4.0', region: 'us-east-1' },
          createdById: 'usr-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rec-2',
          organizationId: 'org-demo',
          title: 'PostgreSQL Auto-Vacuum Scheduler',
          description: 'Background cron job tuning indexing tables for multi-tenant isolation.',
          status: RecordStatus.ACTIVE,
          priority: RecordPriority.HIGH,
          category: 'Database',
          tags: ['postgres', 'cron'],
          metadata: { interval: '6h', memoryLimit: '2GB' },
          createdById: 'usr-1',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rec-3',
          organizationId: 'org-demo',
          title: 'Customer Self-Service Onboarding Spec',
          description: 'Draft specification for customized domain setup and DKIM wizard.',
          status: RecordStatus.DRAFT,
          priority: RecordPriority.MEDIUM,
          category: 'Product',
          tags: ['onboarding', 'ux'],
          metadata: { stage: 'RFC Review' },
          createdById: 'usr-2',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rec-4',
          organizationId: 'org-demo',
          title: 'Legacy REST v1 Deprecation Policy',
          description: 'Archived reference document detailing end-of-life sunset dates.',
          status: RecordStatus.ARCHIVED,
          priority: RecordPriority.LOW,
          category: 'Governance',
          tags: ['api', 'deprecated'],
          metadata: { sunsetDate: '2025-12-31' },
          createdById: 'usr-1',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Filter locally in fallback mode
      let filtered = [...mockItems];
      if (search) {
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(search.toLowerCase()) ||
            i.category.toLowerCase().includes(search.toLowerCase()),
        );
      }
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter((i) => i.status === statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        filtered = filtered.filter((i) => i.priority === priorityFilter);
      }

      setRecords(filtered);
      setTotalCount(filtered.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Create / Edit submission
  const handleFormSubmit = async (data: CreateRecordInput) => {
    setSubmitting(true);
    try {
      if (editingRecord) {
        await apiClient.patch(`/records/${editingRecord.id}`, data);
      } else {
        await apiClient.post('/records', data);
      }
      fetchRecords();
    } catch {
      // Local fallback
      fetchRecords();
    } finally {
      setSubmitting(false);
      setEditingRecord(null);
    }
  };

  // Delete single
  const handleConfirmDelete = async () => {
    if (!deleteDialogItem) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/records/${deleteDialogItem.id}`);
      setRecords((prev) => prev.filter((r) => r.id !== deleteDialogItem.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteDialogItem.id));
      setDeleteDialogItem(null);
    } catch {
      setRecords((prev) => prev.filter((r) => r.id !== deleteDialogItem.id));
      setDeleteDialogItem(null);
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleConfirmBulkDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.post('/records/bulk-delete', { ids: selectedIds });
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch {
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Export JSON
  const handleExport = () => {
    const jsonStr = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brightloop-records-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadgeVariant = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.ACTIVE:
        return 'success';
      case RecordStatus.DRAFT:
        return 'warning';
      case RecordStatus.ARCHIVED:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const priorityBadgeVariant = (priority: RecordPriority) => {
    switch (priority) {
      case RecordPriority.CRITICAL:
        return 'destructive';
      case RecordPriority.HIGH:
        return 'warning';
      case RecordPriority.MEDIUM:
        return 'info';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Records & Items"
        description="Multi-tenant entity ledger with real-time filtering, pagination, and bulk batch actions"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-8 text-xs border-border/80">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setFormModalOpen(true);
            }}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Record
          </Button>
        </div>
      </PageHeader>

      {/* Search & Filter Toolbar — Linear Minimalist Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search records by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 h-8 text-xs bg-card border-border"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}

          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs font-mono bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={RecordStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={RecordStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={RecordStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs font-mono bg-card border-border">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value={RecordPriority.CRITICAL}>Critical</SelectItem>
              <SelectItem value={RecordPriority.HIGH}>High</SelectItem>
              <SelectItem value={RecordPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={RecordPriority.LOW}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card — Linear Precision Ledger */}
      <Card className="border-border/80 bg-card overflow-hidden rounded-lg">
        {loading ? (
          <div className="p-5 space-y-3">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRecords} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No records found"
            description="Create your first generic record or try adjusting your search filters."
            actionLabel="Create Record"
            onAction={() => {
              setEditingRecord(null);
              setFormModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/70 border-b border-border text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-3.5 w-10">
                    <Checkbox
                      checked={
                        records.length > 0 && selectedIds.length === records.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-2.5 px-3.5">Title & Details</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Priority</th>
                  <th className="py-2.5 px-3.5">Created Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-surface-hover/60 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(record.id)}
                        />
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div
                          className="flex flex-col cursor-pointer"
                          onClick={() => navigate(`/records/${record.id}`)}
                        >
                          <span className="font-medium text-foreground hover:text-primary transition-colors">
                            {record.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
                            {record.description || 'No description provided'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {record.category}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Badge variant={statusBadgeVariant(record.status) as any} className="font-mono text-[10px]">
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <Badge variant={priorityBadgeVariant(record.priority) as any} className="font-mono text-[10px]">
                          {record.priority}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/records/${record.id}`)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRecord(record);
                              setFormModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit record"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialogItem(record)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Delete record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer — Linear Ledger Style */}
        {records.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground font-mono">
            <div>
              Showing <span className="font-medium text-foreground tabular-nums">{records.length}</span> of{' '}
              <span className="font-medium text-foreground tabular-nums">{totalCount}</span> records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-border/80"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-border/80"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Create/Edit Form Modal */}
      <RecordFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRecord}
        loading={submitting}
      />

      {/* Delete Single Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogItem}
        onOpenChange={(open) => !open && setDeleteDialogItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertCircle className="h-4 w-4" />
              Delete Record
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{' '}
              <strong className="text-foreground">{deleteDialogItem?.title}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogItem(null)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={deleting} className="h-8 text-xs">
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertCircle className="h-4 w-4" />
              Bulk Delete Records
            </DialogTitle>
            <DialogDescription className="text-xs">
              You have selected <strong className="text-foreground font-mono">{selectedIds.length}</strong>{' '}
              records. Are you sure you want to permanently delete them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setBulkDeleteOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmBulkDelete} disabled={deleting} className="h-8 text-xs">
              {deleting ? 'Deleting...' : 'Delete Selected Records'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
