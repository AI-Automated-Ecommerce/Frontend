import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Eye, Package, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, updateOrderStatus } from '@/services/adminService';

const Orders = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        toast({ title: 'Status updated', description: 'Order status has been updated successfully' });
    },
    onError: () => {
        toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    }
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const shippedOrders = orders.filter((o) => o.status === 'shipped');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Paid</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Shipped</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    statusMutation.mutate({ orderId, status: newStatus });
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderTable = ({ orderList }: { orderList: Order[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
            <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
            </TableRow>
        ) : orderList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          orderList.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>{order.items.length} items</TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
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
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and track all customer orders</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <Card>
          <TabsContent value="all" className="m-0">
            <OrderTable orderList={orders} />
          </TabsContent>
          <TabsContent value="pending" className="m-0">
            <OrderTable orderList={pendingOrders} />
          </TabsContent>
          <TabsContent value="paid" className="m-0">
            <OrderTable orderList={paidOrders} />
          </TabsContent>
          <TabsContent value="shipped" className="m-0">
            <OrderTable orderList={shippedOrders} />
          </TabsContent>
          <TabsContent value="completed" className="m-0">
            <OrderTable orderList={completedOrders} />
          </TabsContent>
        </Card>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order {selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Order details and status management
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p><strong>Address:</strong> {selectedOrder.shippingAddress}</p>
                    <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Status</h4>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value: OrderStatus) =>
                      handleStatusChange(selectedOrder.id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ordered: {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${selectedOrder.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
