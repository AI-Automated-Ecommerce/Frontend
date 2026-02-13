import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users, Loader2, WalletCards, ShoppingCart, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/services/adminService';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [customers, searchQuery],
  );

  const totalRevenue = customers.reduce((acc, customer) => acc + customer.totalSpent, 0);
  const totalOrders = customers.reduce((acc, customer) => acc + customer.totalOrders, 0);
  const averageSpend = customers.length ? totalRevenue / customers.length : 0;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getTier = (amount: number) => {
    if (amount > 5000) return { label: 'Platinum', tone: 'bg-violet-100 text-violet-700' };
    if (amount > 2000) return { label: 'Gold', tone: 'bg-amber-100 text-amber-700' };
    return { label: 'Regular', tone: 'bg-slate-100 text-slate-700' };
  };

  if (isLoading) {
    return (
      <div className="admin-surface flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-surface p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Customer Management</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">View customer profiles, order behavior, and account value.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-metric-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Customers</p>
            <Users className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{customers.length}</p>
          <p className="mt-1 text-sm text-slate-500">Registered customer accounts</p>
        </div>
        <div className="admin-metric-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Customer Revenue</p>
            <WalletCards className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-500">Combined spending value</p>
        </div>
        <div className="admin-metric-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Orders</p>
            <ShoppingCart className="h-4 w-4 text-violet-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="mt-1 text-sm text-slate-500">All orders from customers</p>
        </div>
        <div className="admin-metric-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Avg. Spend</p>
            <UserPlus className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${averageSpend.toFixed(2)}</p>
          <p className="mt-1 text-sm text-slate-500">Per customer average spend</p>
        </div>
      </div>

      <div className="admin-surface p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search customers by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
          />
        </div>
      </div>

      <div className="admin-surface overflow-hidden p-2">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total Spent</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tier</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                const tier = getTier(customer.totalSpent);
                return (
                  <TableRow key={customer.id} className="border-slate-200 hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                          <span className="text-sm font-semibold text-sky-700">
                            {customer.name
                              .split(' ')
                              .map((name) => name[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{customer.phone}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-slate-600">{customer.address}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="rounded-md bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {customer.totalOrders}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-800">${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-md ${tier.tone}`}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(customer.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Customers;
