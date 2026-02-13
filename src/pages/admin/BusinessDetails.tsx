import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessDetail } from '@/types/business';

const BusinessDetails = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const { data: details, isLoading } = useQuery({
    queryKey: ['businessDetails'],
    queryFn: businessService.getAllDetails,
  });

  const createMutation = useMutation({
    mutationFn: businessService.createDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDetails'] });
      setIsAddOpen(false);
      setFormData({ title: '', content: '' });
      toast.success('Section created successfully');
    },
    onError: () => toast.error('Failed to create section'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) =>
      businessService.updateDetail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDetails'] });
      setEditingId(null);
      setFormData({ title: '', content: '' });
      toast.success('Section updated successfully');
    },
    onError: () => toast.error('Failed to update section'),
  });

  const deleteMutation = useMutation({
    mutationFn: businessService.deleteDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessDetails'] });
      toast.success('Section deleted successfully');
    },
    onError: () => toast.error('Failed to delete section'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (detail: BusinessDetail) => {
    setEditingId(detail.id);
    setFormData({ title: detail.title, content: detail.content });
    setIsAddOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Business Details</h2>
          <p className="text-sm text-slate-500">Manage custom sections like About Us, Services, and Pricing.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({ title: '', content: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Section' : 'Add New Section'}</DialogTitle>
              <DialogDescription>
                Add a title and content for this business section. The AI agent will use this information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Title</label>
                <Input
                  placeholder="e.g. Our Services"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Content</label>
                <Textarea
                  placeholder="Describe your services here..."
                  className="min-h-[150px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Save Changes' : 'Create Section'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : details?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">No details added yet</h3>
            <p className="mb-4 text-sm text-slate-500">
              Add sections regarding your business to help the AI understand your services better.
            </p>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>
              Add First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {details?.map((detail) => (
            <Card key={detail.id} className="relative overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900">{detail.title}</CardTitle>
                <CardDescription className="text-xs">
                  Updated {detail.updated_at ? new Date(detail.updated_at).toLocaleDateString() : 'recently'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                  {detail.content}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900"
                    onClick={() => openEdit(detail)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(detail.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDetails;
