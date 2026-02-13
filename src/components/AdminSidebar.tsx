import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  Command,
  Search,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Orders', url: '/orders', icon: ShoppingCart, badge: 2 },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Customer Chats', url: '/chats', icon: MessageCircle },
  { title: 'Business Details', url: '/business-details', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className={`border-b border-slate-200 ${collapsed ? 'px-1 pb-3 pt-4' : 'px-4 pb-4 pt-6'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-1'}`}>
          <div className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-900 ${collapsed ? 'h-9 w-9' : 'h-10 w-10'}`}>
            <Command className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">Property</span>
              <span className="text-xs text-slate-500">Dashboard Workspace</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tools"
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm shadow-none focus-visible:ring-sky-200"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={collapsed ? 'p-0' : 'p-3'}>
        <SidebarGroup className={collapsed ? 'p-1' : undefined}>
          {!collapsed && <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Menu</p>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-auto p-0"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-all hover:bg-slate-100/90 hover:text-slate-900"
                      activeClassName="bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="h-5 min-w-5 justify-center rounded-full bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-700"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`border-t border-slate-200 ${collapsed ? 'p-2' : 'p-4'}`}>
        <Button
          variant="ghost"
          className={`w-full rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'}`}
          onClick={() => {
            dispatch(logoutAction());
            navigate('/login');
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
