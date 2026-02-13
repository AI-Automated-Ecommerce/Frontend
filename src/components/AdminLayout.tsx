import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Bell, History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const userInitials = (user?.name || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#eceef2] p-3 md:p-4 lg:p-5">
        <div className="flex min-h-[calc(100vh-1.6rem)] w-full overflow-hidden rounded-[30px] border border-slate-200/90 bg-[#f5f7fb] shadow-[0_28px_74px_-45px_rgba(15,23,42,0.6)]">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <header className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur md:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" />
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 shadow-sm md:flex md:w-[320px]">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for anything..."
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                >
                  <History className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    >
                      <Bell className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 bg-orange-500 px-1.5 text-[10px] text-white">
                        2
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-xl border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-3 font-semibold text-slate-900">Notifications</div>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="font-medium text-slate-900">Payment review needed</span>
                      <span className="text-sm text-slate-500">Order #ORD-001 requires admin verification.</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="font-medium text-slate-900">New customer signup</span>
                      <span className="text-sm text-slate-500">Emily Lynch joined your customer list.</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                  <Avatar className="h-9 w-9 ring-2 ring-sky-100">
                    <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-semibold leading-none text-slate-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">{user?.email || 'admin@store.com'}</p>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-7">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
