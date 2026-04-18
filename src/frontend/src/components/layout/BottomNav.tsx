import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  LayoutDashboard,
  Receipt,
  Settings,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const tabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-card border-t border-border safe-area-bottom"
      aria-label="Tab navigation"
    >
      {/* Subtle logo strip at top of bottom nav */}
      <div
        className="absolute -top-px left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg bg-card border border-border border-b-0"
        style={{ borderTopColor: "oklch(0.72 0.21 150 / 0.3)" }}
        aria-hidden="true"
      >
        <img
          src="/assets/images/bcb-logo.png"
          alt=""
          style={{ width: 14, height: 14, objectFit: "contain" }}
        />
        <span className="text-[9px] font-medium text-primary tracking-wider uppercase hidden sm:block">
          BCB
        </span>
      </div>

      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const showBadge = tab.label === "Alerts" && unread > 0;

        return (
          <Link
            key={tab.href}
            to={tab.href}
            data-ocid={`bottomnav.${tab.label.toLowerCase()}_tab`}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-smooth min-h-[56px]",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="relative">
              <tab.icon className="h-5 w-5" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-t-full bg-primary glow-emerald-subtle" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
