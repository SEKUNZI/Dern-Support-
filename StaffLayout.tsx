import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Monitor, LayoutDashboard, ClipboardList, Package, BarChart3, BookOpen, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { to: "/staff/jobs", label: "Jobs", icon: ClipboardList },
  { to: "/staff/inventory", label: "Inventory", icon: Package },
  { to: "/staff/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/staff/knowledge-base", label: "Knowledge Base", icon: BookOpen },
];

const StaffLayout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Monitor className="h-5 w-5 text-sidebar-primary" />
          <span className="font-bold text-sidebar-foreground">Dern-Support</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  (location.pathname === item.to || (item.to !== "/staff" && location.pathname.startsWith(item.to))) &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-2 px-3 text-sm">
            <User className="h-4 w-4" />
            <span className="truncate">{profile?.full_name || "Staff"}</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <span className="font-bold">Dern-Support</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {sidebarItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button variant={location.pathname === item.to ? "secondary" : "ghost"} size="sm">
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
