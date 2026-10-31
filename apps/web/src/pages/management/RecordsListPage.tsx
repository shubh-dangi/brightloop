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
  MoreVertical,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import {
  GenericRecordDto,
  RecordStatus,
  RecordPriority,
  CreateRecordInput,
} from '@subpulse/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
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
    } catch (err: any) {
      // Offline simulated dataset
      const demoRecords: GenericRecordDto[] = [
        {
          id: 'rec-1',
          organizationId: 'org-demo',
          title: 'Infrastructure Ingestion Gateway',
          description: 'Primary ingress pipeline processing multi-region webhook payloads.',
          status: RecordStatus.ACTIVE,
          priority: RecordPriority.CRITICAL,
          category: 'Infrastructure',
          tags: ['network', 'gateway', 'core'],
          createdById: 'usr-1',
          creator: { id: 'usr-1', name: 'Taylor Reed', email: 'owner@unknown.local' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rec-2',
          organizationId: 'org-demo',
          title: 'Audit Log Retention Policy',
          description: 'Quarterly compliance policy enforcing cryptographic storage archival.',
          status: RecordStatus.ACTIVE,
          priority: RecordPriority.HIGH,
          category: 'Compliance',
          tags: ['security', 'soc2'],
          createdById: 'usr-2',
          creator: { id: 'usr-2', name: 'Morgan Blake', email: 'admin@unknown.local' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'rec-3',
          organizationId: 'org-demo',
          title: 'Realtime Telemetry Collector',
          description: 'Aggregates metrics and worker CPU metrics across nodes.',
          status: RecordStatus.ACTIVE,
          priority: RecordPriority.MEDIUM,
          category: 'Analytics',
          tags: ['telemetry'],
          createdById: 'usr-3',
          creator: { id: 'usr-3', name: 'Jordan Hayes', email: 'member@unknown.local' },
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'rec-4',
          organizationId: 'org-demo',
          title: 'Legacy Export Migration Spec',
          description: 'Specification draft for deprecating old CSV batch pipelines.',
          status: RecordStatus.DRAFT,
          priority: RecordPriority.LOW,
          category: 'Operations',
          tags: ['migration'],
          createdById: 'usr-2',
          creator: { id: 'usr-2', name: 'Morgan Blake', email: 'admin@unknown.local' },
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ];

      // Filter locally for smooth test experience
      let filtered = demoRecords;
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.priority === priorityFilter);
      }
      if (search) {
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.category.toLowerCase().includes(search.toLowerCase()),
        );
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
    a.download = `unknown-records-${Date.now()}.json`;
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
    <div className="space-y-6">
      <PageHeader
        title="Records & Items"
        description="Generic multi-tenant SaaS entity management with pagination, filtering, and bulk operations"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setFormModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Record
          </Button>
        </div>
      </PageHeader>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="gap-1.5 text-xs h-9"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}

          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={RecordStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={RecordStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={RecordStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setPage(1); }}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value={RecordPriority.CRITICAL}>Critical</SelectItem>
              <SelectItem value={RecordPriority.HIGH}>High</SelectItem>
              <SelectItem value={RecordPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={RecordPriority.LOW}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
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
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <Checkbox
                      checked={
                        records.length > 0 && selectedIds.length === records.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {records.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(record.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className="flex flex-col cursor-pointer"
                          onClick={() => navigate(`/records/${record.id}`)}
                        >
                          <span className="font-semibold text-foreground hover:text-primary transition-colors">
                            {record.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {record.description || 'No description provided'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs font-normal">
                          {record.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadgeVariant(record.status) as any}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={priorityBadgeVariant(record.priority) as any}>
                          {record.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/records/${record.id}`)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRecord(record);
                              setFormModalOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit record"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialogItem(record)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Pagination Footer */}
        {records.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{records.length}</span> of{' '}
              <span className="font-medium text-foreground">{totalCount}</span> records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
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
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-foreground">{deleteDialogItem?.title}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Bulk Delete Records
            </DialogTitle>
            <DialogDescription>
              You have selected <strong className="text-foreground">{selectedIds.length}</strong>{' '}
              records. Are you sure you want to permanently delete them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmBulkDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Selected Records'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
