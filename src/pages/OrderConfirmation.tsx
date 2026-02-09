import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PlaceOrderResponse } from '../services/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails as PlaceOrderResponse;

  if (!orderDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => navigate('/store')}>Go to Store</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Order Placed Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="text-2xl font-bold">#{orderId}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Details</h3>
              
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{orderDetails.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{orderDetails.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-xl font-bold">${orderDetails.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                {orderDetails.message}
              </p>
              {orderDetails.payment_method === 'Cash on Delivery' && (
                <p className="mt-2 text-sm text-blue-900">
                  Please keep the exact amount ready for delivery.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/checkout')}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Place Another Order
              </Button>
              <Button className="flex-1" onClick={() => navigate('/')}>
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
