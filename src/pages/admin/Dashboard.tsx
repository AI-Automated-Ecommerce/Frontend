import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/adminService';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingOrdersCount = stats?.pendingOrders || 0;
  const totalRevenueValue = stats?.totalRevenue || 0;
  const totalProductsCount = stats?.totalProducts || 0;
  const totalCustomersCount = stats?.totalCustomers || 0;

  // Stats array removed in favor of API data

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">New</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Pending Orders',
            value: pendingOrdersCount,
            description: 'Orders awaiting processing',
            icon: ShoppingCart,
            color: 'text-blue-600 bg-blue-100',
          },
          {
            title: 'Pending Orders',
            value: pendingOrdersCount,
            description: 'Orders being processed',
            icon: Clock,
            color: 'text-orange-600 bg-orange-100',
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenueValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            description: 'From all orders',
            icon: DollarSign,
            color: 'text-green-600 bg-green-100',
          },
          {
            title: 'Total Products',
            value: totalProductsCount,
            description: 'Active products',
            icon: Package,
            color: 'text-purple-600 bg-purple-100',
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-2"
          onClick={() => navigate('/admin/orders?status=pending')}
        >
          <ShoppingCart className="h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-medium">Process Pending Orders</div>
            <div className="text-sm text-muted-foreground">{pendingOrdersCount} orders waiting</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-2"
          onClick={() => navigate('/admin/products')}
        >
          <Package className="h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-medium">Manage Products</div>
            <div className="text-sm text-muted-foreground">{totalProductsCount} products</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-2"
          onClick={() => navigate('/admin/customers')}
        >
          <TrendingUp className="h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-medium">View Customers</div>
            <div className="text-sm text-muted-foreground">{totalCustomersCount} customers</div>
          </div>
        </Button>
      </div>

      {/* Recent Orders - removed for now as we don't fetch them here, or could fetch top 5 */}
      {/* <Card> ... </Card> */}
    </div>
  );
};

export default Dashboard;
