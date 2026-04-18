import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  User,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { Badge } from "../BankBadge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  // TESTING MODE: get phone from localStorage
  const phone = localStorage.getItem("bcb_auth_phone") ?? "Guest User";
  const maskedPhone =
    phone.length > 7 ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : phone;

  function handleLogout() {
    localStorage.removeItem("bcb_auth_phone");
    navigate({ to: "/" });
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Bank logo */}
      <div className="flex flex-col items-center gap-2 px-5 py-5 border-b border-border">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full"
            style={{
              width: 80,
              height: 80,
              background:
                "radial-gradient(circle, oklch(0.72 0.21 150 / 0.15) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <img
            src="/assets/images/bcb-logo.png"
            alt="Bawjiase Community Bank PLC"
            className="relative z-10 drop-shadow-[0_0_10px_oklch(0.72_0.21_150_/_0.35)]"
            style={{ width: 64, height: 64, objectFit: "contain" }}
          />
        </div>
        <div className="text-center min-w-0">
          <p className="font-display font-bold text-sm text-foreground leading-tight">
            Bawjiase
          </p>
          <p className="text-[10px] text-primary tracking-wider uppercase">
            Community Bank PLC
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={`nav.${item.label.toLowerCase()}_link`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth relative group",
                isActive
                  ? "bg-primary/15 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive && "drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]",
                )}
              />
              <span className="truncate">{item.label}</span>
              {item.label === "Notifications" && unread > 0 && (
                <Badge count={unread} size="sm" className="ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              Kwame Mensah
            </p>
            <p className="text-[10px] text-muted-foreground truncate font-mono">
              {maskedPhone}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="nav.logout_button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
