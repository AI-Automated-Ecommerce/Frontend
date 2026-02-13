import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShoppingCart,
  Package,
  DollarSign,
  Clock3,
  Users,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders, getCustomers, getDashboardStats } from '@/services/adminService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getDashboardStats,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  if (isLoadingStats) {
    return (
      <div className="admin-surface flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalOrdersCount = stats?.totalOrders || 0;
  const pendingOrdersCount = stats?.pendingOrders || 0;
  const totalRevenueValue = stats?.totalRevenue || 0;
  const totalProductsCount = stats?.totalProducts || 0;
  const totalCustomersCount = stats?.totalCustomers || 0;
  const completedOrdersCount = Math.max(totalOrdersCount - pendingOrdersCount, 0);
  const completionRate = totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 0;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenueValue / totalOrdersCount : 0;

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const salesHeatmap = [
    {
      month: 'August',
      points: [0, 2, 0, 1, 0, 2, 0, 1, 2, 0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 2, 0],
    },
    {
      month: 'September',
      points: [1, 0, 1, 2, 1, 2, 2, 1, 2, 0, 1, 2, 0, 1, 2, 2, 1, 0, 1, 2, 1],
    },
    {
      month: 'October',
      points: [0, 1, 2, 1, 2, 2, 0, 2, 0, 1, 2, 1, 2, 2, 1, 0, 2, 0, 1, 2, 1],
    },
  ];

  const portfolioSummary = [
    { label: 'Completed', value: completedOrdersCount, color: '#8B5CF6' },
    { label: 'Pending', value: pendingOrdersCount, color: '#EAB308' },
    { label: 'Customers', value: totalCustomersCount, color: '#0EA5E9' },
  ];
  const summaryTotal = portfolioSummary.reduce((acc, item) => acc + item.value, 0);
  let runningPosition = 0;
  const donutGradient = summaryTotal
    ? `conic-gradient(${portfolioSummary
        .map((segment) => {
          const start = (runningPosition / summaryTotal) * 360;
          runningPosition += segment.value;
          const end = (runningPosition / summaryTotal) * 360;
          return `${segment.color} ${start}deg ${end}deg`;
        })
        .join(', ')})`
    : 'conic-gradient(#dbeafe 0deg 360deg)';

  const topCustomer = customers.length
    ? [...customers].sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0))[0]
    : null;

  const pendingAttentionOrders = orders
    .filter((order) => order.status === 'pending' || order.status === 'payment_review_requested')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const formatOrderTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6">
      <div className="admin-surface flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Dashboard Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Good morning, team</h1>
          <p className="mt-1 text-sm text-slate-500">{todayLabel}</p>
        </div>
        <Button className="h-11 rounded-xl px-4 text-sm font-semibold shadow-sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Total Orders',
            value: totalOrdersCount,
            description: 'All orders this month',
            icon: ShoppingCart,
            accent: 'bg-sky-100 text-sky-700',
            trend: `+${Math.max(completionRate, 1)}%`,
          },
          {
            title: 'Pending Orders',
            value: pendingOrdersCount,
            description: 'Orders to process',
            icon: Clock3,
            accent: 'bg-amber-100 text-amber-700',
            trend: '-8%',
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenueValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            description: 'Revenue this month',
            icon: DollarSign,
            accent: 'bg-emerald-100 text-emerald-700',
            trend: '+15%',
          },
          {
            title: 'Total Products',
            value: totalProductsCount,
            description: `${totalCustomersCount} active customers`,
            icon: Package,
            accent: 'bg-violet-100 text-violet-700',
            trend: '+6%',
          },
        ].map((stat) => (
          <div key={stat.title} className="admin-metric-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
              </div>
              <div className={cn('rounded-xl p-2.5', stat.accent)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <Badge className="mt-4 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              {stat.trend}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="admin-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sales Overview</h2>
              <p className="mt-1 text-sm text-slate-500">Performance pattern across recent months</p>
            </div>
            <Badge className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-100">This Year</Badge>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {salesHeatmap.map((month) => (
              <div key={month.month} className="admin-subtle-surface p-4">
                <p className="text-sm font-semibold text-slate-700">{month.month}</p>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {month.points.map((point, index) => (
                    <div
                      key={`${month.month}-${index}`}
                      className={cn(
                        'h-4 rounded-[4px]',
                        point === 0 && 'bg-slate-100',
                        point === 1 && 'bg-sky-200',
                        point === 2 && 'bg-violet-500',
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700"
              onClick={() => navigate('/orders')}
            >
              Review Orders
            </Button>
            <Button className="h-10 rounded-xl px-4" onClick={() => navigate('/products')}>
              Manage Catalog
            </Button>
          </div>
        </div>

        <div className="admin-surface overflow-hidden">
          <div className="admin-gradient-panel p-5">
            <div className="flex items-center justify-between">
              <Badge className="rounded-lg bg-white/60 px-2.5 py-1 text-slate-700 hover:bg-white/60">Customer Detail</Badge>
              <Users className="h-4 w-4 text-slate-600" />
            </div>
          </div>
          <div className="space-y-5 px-5 pb-5 pt-4">
            {isLoadingCustomers ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
              </div>
            ) : !topCustomer ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-slate-700">No customers yet</p>
                <p className="mt-1 text-sm text-slate-500">Once customers exist, a top customer summary will appear here.</p>
                <Button className="mt-4 h-10 rounded-xl" onClick={() => navigate('/customers')}>
                  Open Customers
                </Button>
              </div>
            ) : (
              <>
                <div className="-mt-12 flex items-end gap-4">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                    <AvatarFallback className="bg-sky-100 text-lg font-semibold text-sky-700">
                      {topCustomer.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-100">
                    ${topCustomer.totalSpent.toFixed(2)} spent
                  </Badge>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-900">{topCustomer.name}</h3>
                  <p className="text-slate-500">Top customer by total spend</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate('/customers')}
                  >
                    View Customers
                  </Button>
                  <Button className="h-10 rounded-xl" onClick={() => navigate('/orders')}>
                    View Orders
                  </Button>
                </div>
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <h4 className="text-lg font-semibold text-slate-900">Contact information</h4>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {topCustomer.email}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {topCustomer.phone}
                  </p>
                  <p className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    {topCustomer.address}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="admin-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Needs Attention</h3>
            <Badge className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-100">
              {pendingOrdersCount} Open
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {isLoadingOrders ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
              </div>
            ) : pendingAttentionOrders.length === 0 ? (
              <div className="admin-subtle-surface p-4">
                <p className="font-semibold text-slate-800">All clear</p>
                <p className="mt-1 text-sm text-slate-500">No pending or payment review orders right now.</p>
                <Button variant="outline" className="mt-3 h-9 rounded-xl border-slate-200" onClick={() => navigate('/orders')}>
                  Open Orders
                </Button>
              </div>
            ) : (
              pendingAttentionOrders.map((order) => (
                <div key={order.id} className="admin-subtle-surface p-3">
                  <p className="font-semibold text-slate-800">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.customerName}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="rounded-md bg-amber-100 text-amber-700 hover:bg-amber-100">
                      {order.status === 'payment_review_requested' ? 'Payment Review' : 'Pending'}
                    </Badge>
                    <p className="text-xs text-slate-500">{formatOrderTime(order.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
            <Button variant="ghost" className="h-8 rounded-lg px-3 text-slate-500 hover:bg-slate-100">
              View all
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {isLoadingOrders ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="admin-subtle-surface p-4">
                <p className="font-semibold text-slate-800">No activity yet</p>
                <p className="mt-1 text-sm text-slate-500">Recent orders will show up here once they exist.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="admin-subtle-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{order.status.toUpperCase()}</p>
                  <p className="mt-1 font-medium text-slate-800">Order #{order.id} from {order.customerName}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatOrderTime(order.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Portfolio Status</h3>
            <Badge className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-100">This Month</Badge>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative h-28 w-28 rounded-full"
              style={{ background: donutGradient }}
            >
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{summaryTotal}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {portfolioSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Completion Rate</span>
              <span className="font-semibold text-slate-900">{completionRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Average Order Value</span>
              <span className="font-semibold text-slate-900">${averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-surface flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-slate-500">Need to take action on pending work?</p>
          <h3 className="text-xl font-semibold text-slate-900">Process pending orders and notify your team.</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => navigate('/customers')}>
            <Users className="h-4 w-4" />
            View Customers
          </Button>
          <Button className="rounded-xl" onClick={() => navigate('/orders')}>
            <CheckCircle2 className="h-4 w-4" />
            Go to Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
