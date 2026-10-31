import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateRecordSchema,
  CreateRecordInput,
  RecordStatus,
  RecordPriority,
  GenericRecordDto,
} from '@subpulse/contracts';
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
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Record' : 'Create New Record'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the record details and priority settings'
                : 'Add a new generic item to this multi-tenant workspace'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="title">
                Record Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Ingestion Pipeline Spec"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Category</label>
                <Input
                  id="category"
                  placeholder="e.g. Infrastructure, Analytics"
                  {...register('category')}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Priority</label>
                <Select
                  value={currentPriority}
                  onValueChange={(val) => setValue('priority', val as RecordPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecordPriority.LOW}>Low</SelectItem>
                    <SelectItem value={RecordPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={RecordPriority.HIGH}>High</SelectItem>
                    <SelectItem value={RecordPriority.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Lifecycle Status</label>
              <Select
                value={currentStatus}
                onValueChange={(val) => setValue('status', val as RecordStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RecordStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={RecordStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={RecordStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="description">
                Description / Details
              </label>
              <Textarea
                id="description"
                placeholder="Detailed summary or notes for this record..."
                className="min-h-[90px]"
                {...register('description')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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
