import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetNotifications } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Scale,
  FileText,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { data: notificationsData } = useGetNotifications();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const unreadCount = (Array.isArray(notificationsData) ? notificationsData : []).filter(n => !n.read).length || 0;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Clientes", href: "/admin/clients" },
    { icon: Briefcase, label: "Casos", href: "/admin/cases" },
    { icon: Scale, label: "Advogados", href: "/admin/lawyers" },
    { icon: FileText, label: "Blog", href: "/admin/blog" },
    { icon: Bell, label: "Notificações", href: "/admin/notifications", badge: unreadCount },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50 text-zinc-300">
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-serif font-bold text-white tracking-tight">SILVA</span>
          <span className="text-[0.6rem] tracking-[0.2em] text-zinc-500 uppercase">Sistema Interno</span>
        </div>
      </div>

      <div className="p-6 flex items-center gap-4 border-b border-zinc-800/50">
        <Avatar className="h-10 w-10 border border-zinc-800">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="bg-zinc-900 text-zinc-400">
            {user ? getInitials(user.name) : "AD"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium text-zinc-100 truncate">{user?.name}</span>
          <span className="text-xs text-zinc-500 truncate">{user?.isAdmin ? "Sócio Administrador" : "Advogado Associado"}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-zinc-900 text-amber-500 font-medium"
                  : "hover:bg-zinc-900/50 hover:text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${isActive ? "text-amber-500" : "text-zinc-500"}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          onClick={() => logout()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800/50 h-16 flex items-center px-4 justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-serif font-bold text-white tracking-tight">SILVA</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-zinc-950 border-r-zinc-800/50 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Top Bar for Desktop */}
        <header className="hidden md:flex h-16 items-center justify-end px-8 border-b border-zinc-800/30 bg-[#0a0a0c]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link href="/admin/notifications" className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
