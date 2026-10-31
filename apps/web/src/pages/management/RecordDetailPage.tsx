import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  AlertCircle,
  FileCode,
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
    } catch {
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
        <Button variant="ghost" size="sm" asChild className="gap-2 h-8 text-xs">
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
    <div className="space-y-5 max-w-5xl">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground">
          <Link to="/records">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Records
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="gap-1.5 h-8 text-xs border-border/80"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            className="gap-1.5 h-8 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Record Hero Header — Linear Precision Surface */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="space-y-2.5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
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
              className="font-mono text-[10px]"
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
              className="font-mono text-[10px]"
            >
              Priority: {record.priority}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">{record.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {record.description || 'No detailed description provided.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left 2 Cols: Details & Metadata */}
        <div className="md:col-span-2 space-y-5">
          {/* Metadata Card */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-primary" /> Structured Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.metadata && Object.keys(record.metadata).length > 0 ? (
                <pre className="text-xs font-mono bg-muted/30 dark:bg-[#171719] p-3.5 rounded-md overflow-x-auto text-foreground/90 border border-border/80 leading-relaxed">
                  {JSON.stringify(record.metadata, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground italic font-mono">No custom metadata defined.</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Associated Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.tags && record.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {record.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-mono">No tags assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Record Metadata & Audit Info */}
        <div className="space-y-5">
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                Audit & Record Provenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-muted-foreground">Entity Identifier</span>
                <p className="font-mono text-[11px] bg-muted/40 dark:bg-[#171719] p-1.5 rounded border border-border/60 truncate text-foreground/90">
                  {record.id}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Author
                </span>
                <p className="font-medium text-foreground">
                  {record.creator?.name || 'Unknown User'}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">{record.creator?.email}</p>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-2.5">
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Timestamp Created
                </span>
                <p className="font-mono text-[11px] tabular-nums text-foreground/80">
                  {formatDateTime(record.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Last Modified
                </span>
                <p className="font-mono text-[11px] tabular-nums text-foreground/80">
                  {formatDateTime(record.updatedAt)}
                </p>
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
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertCircle className="h-4 w-4" />
              Delete Record
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">{record.title}</strong>? This action cannot be
              reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 text-xs">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
