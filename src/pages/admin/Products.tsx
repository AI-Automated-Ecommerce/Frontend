import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, Package, Loader2, Boxes } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  uploadImage,
} from '@/services/adminService';

const Products = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const convertGDriveLink = (url: string) => {
    if (!url) return url;
    const driveMatch = url.match(/\/file\/d\/(.+?)\/(view|edit)/) || url.match(/id=(.+?)(&|$)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getProducts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({ title: 'Product added', description: 'Product has been created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({ title: 'Product updated', description: 'Product has been updated successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({ title: 'Product deleted', description: 'Product has been deleted successfully' });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    },
  });

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === 'all' || categories.find((c) => c.id === product.categoryId)?.name === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [products, searchQuery, categoryFilter, categories],
  );

  const lowStockCount = products.filter((product) => product.stockQuantity <= 10).length;
  const activeProducts = products.filter((product) => product.isActive).length;
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stockQuantity, 0);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      categoryId: '',
      imageUrl: '',
      isActive: true,
    });
    setSelectedProduct(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl }));
      toast({ title: 'Success', description: 'Image uploaded to Google Drive' });
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Could not upload image to Google Drive';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (selectedProduct) {
      updateMutation.mutate({
        id: selectedProduct.id,
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl,
          isActive: formData.isActive,
        },
      });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300',
      isActive: true,
    });
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-surface flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Catalog Management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Maintain product inventory, categories, and pricing.</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="h-11 rounded-xl px-4 font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{products.length}</p>
          <p className="mt-1 text-sm text-slate-500">{activeProducts} active listings</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Low Stock</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{lowStockCount}</p>
          <p className="mt-1 text-sm text-slate-500">Products with 10 or fewer units</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Categories</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{categories.length}</p>
          <p className="mt-1 text-sm text-slate-500">Distinct product categories</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Inventory Value</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">${inventoryValue.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-500">Estimated total stock value</p>
        </div>
      </div>

      <div className="admin-surface p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white md:w-[240px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="admin-surface overflow-hidden p-2">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Price</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingProducts ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-slate-200 hover:bg-slate-50/70">
                  <TableCell>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="max-w-[220px] truncate text-sm text-slate-500">{product.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-md bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        product.stockQuantity > 20
                          ? 'rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : product.stockQuantity > 0
                            ? 'rounded-md bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : 'rounded-md bg-rose-100 text-rose-700 hover:bg-rose-100'
                      }
                    >
                      {product.stockQuantity} in stock
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg border-slate-200 bg-white"
                        onClick={() => handleOpenEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg border-rose-200 bg-rose-50"
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Package className="h-5 w-5 text-slate-600" />
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Update product details' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="0"
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Product Image</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: convertGDriveLink(e.target.value) })}
                  placeholder="GDrive link or external URL"
                  className="rounded-xl border-slate-200"
                />
                <div className="relative">
                  <Input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-10 rounded-xl border-slate-200"
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Paste a direct URL or upload directly to Google Drive.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSaveProduct}>
              {selectedProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              <Boxes className="mr-1 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
