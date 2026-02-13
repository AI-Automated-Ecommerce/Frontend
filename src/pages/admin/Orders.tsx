import { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Eye, Filter, Loader2, Package, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminOrders, updateOrderStatus } from '@/store/slices/orderSlice';

const Orders = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { items: orders = [], status, error } = useAppSelector((state) => state.orders);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);
  
  // Show error toast if fetch fails
  useEffect(() => {
    if (status === 'failed' && error) {
         toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [status, error, toast]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
      try {
          await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
          toast({ title: 'Status updated', description: 'Order status has been updated successfully' });
          if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
      } catch (err: any) {
          toast({ title: 'Error', description: err.message || 'Failed to update order status', variant: 'destructive' });
      }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.id.toString().includes(query)
        );
      }),
    [orders, searchQuery],
  );

  const orderGroups = useMemo(
    () => ({
      all: filteredOrders,
      pending: filteredOrders.filter((order) => order.status === 'pending'),
      paymentReview: filteredOrders.filter((order) => order.status === 'payment_review_requested'),
      paid: filteredOrders.filter((order) => order.status === 'paid'),
      shipped: filteredOrders.filter((order) => order.status === 'shipped'),
      completed: filteredOrders.filter((order) => order.status === 'completed'),
      cancelled: filteredOrders.filter((order) => order.status === 'cancelled'),
    }),
    [filteredOrders],
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const fulfillmentRate = orders.length
    ? Math.round(((orders.filter((o) => o.status === 'completed' || o.status === 'shipped').length / orders.length) * 100))
    : 0;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="rounded-md bg-amber-100 px-2.5 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      case 'payment_review_requested':
        return <Badge className="rounded-md bg-orange-100 px-2.5 text-orange-700 hover:bg-orange-100">Payment Review</Badge>;
      case 'paid':
        return <Badge className="rounded-md bg-sky-100 px-2.5 text-sky-700 hover:bg-sky-100">Paid</Badge>;
      case 'shipped':
        return <Badge className="rounded-md bg-violet-100 px-2.5 text-violet-700 hover:bg-violet-100">Shipped</Badge>;
      case 'completed':
        return <Badge className="rounded-md bg-emerald-100 px-2.5 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
      case 'cancelled':
        return <Badge className="rounded-md bg-rose-100 px-2.5 text-rose-700 hover:bg-rose-100">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const OrderTable = ({ orderList }: { orderList: Order[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-200 hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Items</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="py-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            </TableCell>
          </TableRow>
        ) : orderList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-12 text-center text-slate-500">
              No matching orders found
            </TableCell>
          </TableRow>
        ) : (
          orderList.map((order) => (
            <TableRow key={order.id} className="border-slate-200 hover:bg-slate-50/70">
              <TableCell className="font-semibold text-slate-800">#{order.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-slate-800">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-700">{order.items.length} items</TableCell>
              <TableCell className="font-semibold text-slate-800">${order.total.toFixed(2)}</TableCell>
              <TableCell className="text-slate-600">{formatDate(order.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDialogOpen(true);
                  }}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="admin-surface flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Order Management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track, review, and update order fulfillment in one place.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
          <p className="mt-1 text-sm text-slate-500">Across all statuses</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Needs Review</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orderGroups.pending.length + orderGroups.paymentReview.length}</p>
          <p className="mt-1 text-sm text-slate-500">Pending and payment checks</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-500">Value of all orders</p>
        </div>
        <div className="admin-metric-card p-5">
          <p className="text-sm text-slate-500">Fulfillment Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{fulfillmentRate}%</p>
          <p className="mt-1 text-sm text-slate-500">Shipped + completed orders</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="admin-surface p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <TabsList className="h-auto flex-wrap rounded-xl bg-slate-100 p-1.5">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white">All ({orderGroups.all.length})</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white">Pending ({orderGroups.pending.length})</TabsTrigger>
              <TabsTrigger value="payment_review" className="rounded-lg data-[state=active]:bg-white">Review ({orderGroups.paymentReview.length})</TabsTrigger>
              <TabsTrigger value="paid" className="rounded-lg data-[state=active]:bg-white">Paid ({orderGroups.paid.length})</TabsTrigger>
              <TabsTrigger value="shipped" className="rounded-lg data-[state=active]:bg-white">Shipped ({orderGroups.shipped.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white">Completed ({orderGroups.completed.length})</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-white">Cancelled ({orderGroups.cancelled.length})</TabsTrigger>
            </TabsList>
            <div className="flex w-full items-center gap-2 xl:w-[360px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search orders or customers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-white pl-9"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 bg-white">
                <Filter className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-surface overflow-hidden p-2">
          <TabsContent value="all" className="m-0">
            <OrderTable orderList={orderGroups.all} />
          </TabsContent>
          <TabsContent value="pending" className="m-0">
            <OrderTable orderList={orderGroups.pending} />
          </TabsContent>
          <TabsContent value="payment_review" className="m-0">
            <OrderTable orderList={orderGroups.paymentReview} />
          </TabsContent>
          <TabsContent value="paid" className="m-0">
            <OrderTable orderList={orderGroups.paid} />
          </TabsContent>
          <TabsContent value="shipped" className="m-0">
            <OrderTable orderList={orderGroups.shipped} />
          </TabsContent>
          <TabsContent value="completed" className="m-0">
            <OrderTable orderList={orderGroups.completed} />
          </TabsContent>
          <TabsContent value="cancelled" className="m-0">
            <OrderTable orderList={orderGroups.cancelled} />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Package className="h-5 w-5 text-slate-600" />
              Order #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>Order details and status management</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="admin-subtle-surface p-4">
                  <h4 className="mb-3 font-semibold text-slate-900">Customer Information</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-medium text-slate-900">Email:</span> {selectedOrder.customerEmail}</p>
                    <p><span className="font-medium text-slate-900">Address:</span> {selectedOrder.shippingAddress}</p>
                    <p><span className="font-medium text-slate-900">Payment:</span> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                <div className="admin-subtle-surface p-4">
                  <h4 className="mb-3 font-semibold text-slate-900">Order Status</h4>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value: OrderStatus) => handleStatusChange(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[220px] rounded-xl border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="payment_review_requested">Payment Review</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-3 text-sm text-slate-500">Ordered: {formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="admin-subtle-surface p-2">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index} className="border-slate-200 hover:bg-slate-50/60">
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableCell colSpan={3} className="text-right font-semibold text-slate-900">Total</TableCell>
                      <TableCell className="text-right text-lg font-bold text-slate-900">${selectedOrder.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
