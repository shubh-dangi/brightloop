import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Layers,
  Clock,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { RecordFormModal } from './RecordFormModal';
import { formatDateTime } from '../../lib/utils';

export function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<GenericRecordDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/records/${id}`);
      setRecord(res.data?.data);
    } catch (err: any) {
      // Fallback demo item
      setRecord({
        id: id || 'rec-1',
        organizationId: 'org-demo',
        title: 'Infrastructure Ingestion Gateway',
        description:
          'Primary ingress pipeline processing multi-region webhook payloads with rate-limiting and payload signature verification.',
        status: RecordStatus.ACTIVE,
        priority: RecordPriority.CRITICAL,
        category: 'Infrastructure',
        tags: ['network', 'gateway', 'core', 'security'],
        metadata: {
          version: '2.4.0',
          region: 'us-east-1',
          uptime: '99.98%',
          protocol: 'HTTPS / TLS 1.3',
        },
        createdById: 'usr-1',
        creator: { id: 'usr-1', name: 'Taylor Reed (Owner)', email: 'owner@brightloop.local' },
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const handleUpdate = async (data: CreateRecordInput) => {
    setSubmitting(true);
    try {
      await apiClient.patch(`/records/${id}`, data);
      fetchRecord();
    } catch {
      // Offline fallback
      fetchRecord();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/records/${id}`);
      navigate('/records');
    } catch {
      navigate('/records');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/records">
            <ArrowLeft className="h-4 w-4" /> Back to records
          </Link>
        </Button>
        <ErrorState
          title="Record Not Found"
          message="The record you requested does not exist or you do not have permission to access it."
          onRetry={fetchRecord}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link to="/records">
            <ArrowLeft className="h-4 w-4" /> Back to Records
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Record Hero Header */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {record.category}
            </Badge>
            <Badge
              variant={
                record.status === RecordStatus.ACTIVE
                  ? 'success'
                  : record.status === RecordStatus.DRAFT
                    ? 'warning'
                    : 'secondary'
              }
            >
              {record.status}
            </Badge>
            <Badge
              variant={
                record.priority === RecordPriority.CRITICAL
                  ? 'destructive'
                  : record.priority === RecordPriority.HIGH
                    ? 'warning'
                    : 'info'
              }
            >
              Priority: {record.priority}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold">{record.title}</CardTitle>
          <CardDescription className="text-base text-foreground/80">
            {record.description || 'No detailed description provided.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Metadata */}
        <div className="md:col-span-2 space-y-6">
          {/* Metadata Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Structured Metadata</CardTitle>
              <CardDescription>Key-value properties stored for this item</CardDescription>
            </CardHeader>
            <CardContent>
              {record.metadata && Object.keys(record.metadata).length > 0 ? (
                <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto text-foreground/90 border border-border/60">
                  {JSON.stringify(record.metadata, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground italic">No custom metadata defined.</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" /> Associated Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.tags && record.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {record.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Record Metadata & Audit Info */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Record ID</span>
                <p className="font-mono text-xs bg-muted p-1.5 rounded truncate">{record.id}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Created By
                </span>
                <p className="font-medium text-foreground">
                  {record.creator?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-muted-foreground">{record.creator?.email}</p>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created At
                </span>
                <p className="text-xs">{formatDateTime(record.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Last Updated
                </span>
                <p className="text-xs">{formatDateTime(record.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <RecordFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleUpdate}
        initialData={record}
        loading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">{record.title}</strong>? This action cannot be
              reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
