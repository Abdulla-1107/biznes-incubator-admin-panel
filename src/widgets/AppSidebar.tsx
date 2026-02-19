import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Handshake,
  GraduationCap,
  Rocket,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Boshqaruv paneli", path: "/", icon: LayoutDashboard },
  { title: "Arizalar", path: "/applications", icon: FileText },
  { title: "Xizmatlar", path: "/services", icon: Wrench },
  { title: "Hamkorlar", path: "/partners", icon: Handshake },
  { title: "Mentorlar", path: "/mentors", icon: GraduationCap },
  { title: "Startuplar", path: "/startups", icon: Rocket },
  { title: "Tadbirlar", path: "/events", icon: CalendarDays },
  { title: "Contactlar", path: "/contacts", icon: Mail },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0 transition-all duration-300 z-30",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground text-lg truncate">
              NafisArt
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
