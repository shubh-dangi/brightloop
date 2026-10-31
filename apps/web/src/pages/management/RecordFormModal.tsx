import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateRecordSchema,
  CreateRecordInput,
  RecordStatus,
  RecordPriority,
  GenericRecordDto,
} from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface RecordFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRecordInput) => Promise<void>;
  initialData?: GenericRecordDto | null;
  loading?: boolean;
}

export function RecordFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
}: RecordFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRecordInput>({
    resolver: zodResolver(CreateRecordSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'General',
      status: RecordStatus.ACTIVE,
      priority: RecordPriority.MEDIUM,
      tags: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        category: initialData.category,
        status: initialData.status,
        priority: initialData.priority,
        tags: initialData.tags || [],
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'General',
        status: RecordStatus.ACTIVE,
        priority: RecordPriority.MEDIUM,
        tags: [],
      });
    }
  }, [initialData, open, reset]);

  const currentStatus = watch('status');
  const currentPriority = watch('priority');

  const onFormSubmit = async (data: CreateRecordInput) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogHeader className="pb-2 border-b border-border/60">
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
              {isEditing ? 'Edit Record' : 'Create New Record'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditing
                ? 'Update entity attributes and operational status'
                : 'Provision a new entity in this multi-tenant workspace'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="title">
                Record Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Ingestion Pipeline Spec"
                className="h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive font-mono">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Category</label>
                <Input
                  id="category"
                  placeholder="e.g. Infrastructure, Analytics"
                  className="h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
                  {...register('category')}
                />
                {errors.category && (
                  <p className="text-[11px] text-destructive font-mono">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Priority</label>
                <Select
                  value={currentPriority}
                  onValueChange={(val) => setValue('priority', val as RecordPriority)}
                >
                  <SelectTrigger className="h-8 text-xs font-mono dark:bg-[#1C1C1F]/60 border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-mono">
                    <SelectItem value={RecordPriority.LOW}>Low</SelectItem>
                    <SelectItem value={RecordPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={RecordPriority.HIGH}>High</SelectItem>
                    <SelectItem value={RecordPriority.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Lifecycle Status</label>
              <Select
                value={currentStatus}
                onValueChange={(val) => setValue('status', val as RecordStatus)}
              >
                <SelectTrigger className="h-8 text-xs font-mono dark:bg-[#1C1C1F]/60 border-border/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono">
                  <SelectItem value={RecordStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={RecordStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={RecordStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="description">
                Description / Notes
              </label>
              <Textarea
                id="description"
                placeholder="Detailed specification or notes for this record..."
                className="min-h-[85px] text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80 resize-none"
                {...register('description')}
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-border/80"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs">
              {loading
                ? isEditing
                  ? 'Saving...'
                  : 'Creating...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
