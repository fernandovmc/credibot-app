"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageSquare, LayoutDashboard as DashboardIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const routes = [
  {
    label: "Dashboard",
    icon: DashboardIcon,
    href: "/",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
  },
  {
    label: "Chat IA",
    icon: MessageSquare,
    href: "/chat",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-20 border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-2">
        {routes.map((route) => {
          const isActive = pathname === route.href ||
            (route.href !== "/" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 relative group",
                isActive
                  ? "bg-primary shadow-lg"
                  : "hover:bg-accent/50"
              )}
            >
              <route.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              {/* Tooltip */}
              <span className="z-50 absolute left-20 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                {route.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-border/50 flex justify-center">
        <div className="relative group">
          <ThemeToggle />
          <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Tema
          </span>
        </div>
      </div>
    </div>
  );
}
