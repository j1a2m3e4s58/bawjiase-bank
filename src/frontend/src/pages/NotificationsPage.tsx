import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  BellOff,
  CheckCheck,
  ChevronDown,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationType } from "../backend";
import { Badge } from "../components/BankBadge";
import { Button } from "../components/BankButton";
import { Card } from "../components/BankCard";
import { EmptyState } from "../components/BankEmptyState";
import { LoadingSkeleton } from "../components/BankLoading";
import { PageHeader } from "../components/layout/PageHeader";
import {
  useDismissNotification,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { formatRelativeTime } from "../lib/formatters";
import { sampleNotifications } from "../lib/sampleData";
import type { NotificationView } from "../types";

// ─── Extra sample notifications required by spec ────────────────────────────
const NOW = BigInt(Date.now()) * 1_000_000n;
const HOUR = 3_600_000_000_000n;
const DAY = 86_400_000_000_000n;

const extraNotifications: NotificationView[] = [
  {
    notifId: 5n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.LoginAlert,
    title: "New Device Login",
    message:
      "Your account was accessed from a new device: iPhone 15 Pro in Kumasi, Ghana. If this wasn't you, secure your account immediately.",
    isRead: false,
    timestamp: NOW - HOUR * 1n,
  },
  {
    notifId: 6n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.TransferConfirmation,
    title: "Transfer Confirmed",
    message:
      "GHGHS 500.00 successfully sent to Ama Mensah (BCB-007-2024-0218). Reference: REF-2024-TXN-887.",
    isRead: false,
    timestamp: NOW - HOUR * 3n,
  },
  {
    notifId: 7n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.AccountActivity,
    title: "Low Balance Warning",
    message:
      "Your checking account balance has fallen below GHGHS 1,000.00. Current balance: GHGHS 842.30.",
    isRead: true,
    timestamp: NOW - HOUR * 8n,
  },
  {
    notifId: 8n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.SecurityAlert,
    title: "Security Code Changed",
    message:
      "Your transaction PIN was successfully updated. If you did not make this change, contact support immediately.",
    isRead: true,
    timestamp: NOW - DAY * 1n,
  },
  {
    notifId: 9n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.AccountActivity,
    title: "ATM Withdrawal",
    message:
      "GHGHS 200.00 withdrawn at Bawjiase BCB ATM #014, Accra Central. Available balance: GHGHS 1,042.30.",
    isRead: true,
    timestamp: NOW - DAY * 2n,
  },
  {
    notifId: 10n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.TransferConfirmation,
    title: "Salary Deposited",
    message:
      "GHGHS 3,500.00 salary payment received from Accra Digital Solutions Ltd. Your account has been credited.",
    isRead: false,
    timestamp: NOW - DAY * 3n,
  },
];

const allSampleNotifs: NotificationView[] = [
  ...extraNotifications.slice(0, 2),
  sampleNotifications[0],
  extraNotifications[2],
  extraNotifications[3],
  sampleNotifications[1],
  extraNotifications[4],
  sampleNotifications[2],
  extraNotifications[5],
  sampleNotifications[3],
].sort((a, b) => Number(b.timestamp - a.timestamp));

// ─── Type config ─────────────────────────────────────────────────────────────
interface TypeConfig {
  Icon: React.ComponentType<{ className?: string }>;
  badgeVariant: "success" | "warning" | "danger" | "muted";
  label: string;
  iconBg: string;
  iconColor: string;
  iconBgRead: string;
  iconColorRead: string;
}

const typeConfig: Record<string, TypeConfig> = {
  [NotificationType.TransferConfirmation]: {
    Icon: ArrowLeftRight,
    badgeVariant: "success",
    label: "Transfer",
    iconBg: "bg-primary/20 border border-primary/30",
    iconColor: "text-primary",
    iconBgRead: "bg-muted/40",
    iconColorRead: "text-muted-foreground",
  },
  [NotificationType.LoginAlert]: {
    Icon: Shield,
    badgeVariant: "warning",
    label: "Login",
    iconBg: "bg-yellow-500/20 border border-yellow-500/30",
    iconColor: "text-yellow-400",
    iconBgRead: "bg-muted/40",
    iconColorRead: "text-muted-foreground",
  },
  [NotificationType.AccountActivity]: {
    Icon: Activity,
    badgeVariant: "muted",
    label: "Activity",
    iconBg: "bg-accent/20 border border-accent/30",
    iconColor: "text-accent",
    iconBgRead: "bg-muted/40",
    iconColorRead: "text-muted-foreground",
  },
  [NotificationType.SecurityAlert]: {
    Icon: AlertTriangle,
    badgeVariant: "danger",
    label: "Security",
    iconBg: "bg-destructive/20 border border-destructive/30",
    iconColor: "text-destructive",
    iconBgRead: "bg-muted/40",
    iconColorRead: "text-muted-foreground",
  },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type FilterTab = "all" | "unread" | "transfers" | "security" | "activity";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "transfers", label: "Transfers" },
  { id: "security", label: "Security" },
  { id: "activity", label: "Activity" },
];

function filterNotifications(
  notifs: NotificationView[],
  tab: FilterTab,
): NotificationView[] {
  switch (tab) {
    case "unread":
      return notifs.filter((n) => !n.isRead);
    case "transfers":
      return notifs.filter(
        (n) => n.notifType === NotificationType.TransferConfirmation,
      );
    case "security":
      return notifs.filter(
        (n) =>
          n.notifType === NotificationType.SecurityAlert ||
          n.notifType === NotificationType.LoginAlert,
      );
    case "activity":
      return notifs.filter(
        (n) => n.notifType === NotificationType.AccountActivity,
      );
    default:
      return notifs;
  }
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ClearAllDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      data-ocid="notifications.dialog"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />
      <Card
        variant="elevated"
        className="relative z-10 p-6 w-full max-w-sm animate-slide-up"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/20 border border-destructive/30 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-lg">
              Clear All Notifications?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This will permanently remove all notifications. This action cannot
              be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onCancel}
              data-ocid="notifications.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={onConfirm}
              data-ocid="notifications.confirm_button"
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: fetchedNotifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const [dismissingIds, setDismissingIds] = useState<Set<bigint>>(new Set());
  const [localNotifs, setLocalNotifs] =
    useState<NotificationView[]>(allSampleNotifs);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync from backend when available
  useEffect(() => {
    if (fetchedNotifications && fetchedNotifications.length > 0) {
      setLocalNotifs(fetchedNotifications);
    }
  }, [fetchedNotifications]);

  const handleDismiss = (notifId: bigint) => {
    setDismissingIds((prev) => new Set(prev).add(notifId));
    setTimeout(() => {
      setLocalNotifs((prev) => prev.filter((n) => n.notifId !== notifId));
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(notifId);
        return next;
      });
      dismiss.mutate(notifId);
    }, 400);
  };

  const handleMarkRead = (notifId: bigint) => {
    setLocalNotifs((prev) =>
      prev.map((n) => (n.notifId === notifId ? { ...n, isRead: true } : n)),
    );
    markRead.mutate(notifId);
  };

  const handleMarkAllRead = () => {
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    for (const n of localNotifs.filter((n) => !n.isRead)) {
      markRead.mutate(n.notifId);
    }
  };

  const handleClearAll = () => {
    const ids = localNotifs.map((n) => n.notifId);
    // Animate all out
    setDismissingIds(new Set(ids));
    setTimeout(() => {
      setLocalNotifs([]);
      setDismissingIds(new Set());
      for (const id of ids) dismiss.mutate(id);
    }, 450);
    setShowClearConfirm(false);
  };

  const filtered = filterNotifications(localNotifs, activeTab);
  const unreadCount = localNotifs.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="space-y-5 max-w-2xl animate-slide-up">
        {/* Header */}
        <PageHeader
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"
          }
          actions={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  data-ocid="notifications.mark_all_read_button"
                  className="gap-1.5"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}
              {localNotifs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  data-ocid="notifications.clear_all_button"
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </Button>
              )}
              {unreadCount > 0 && (
                <Badge variant="default" size="md" count={unreadCount} />
              )}
            </div>
          }
        />

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
          data-ocid="notifications.filter.tab"
        >
          {TABS.map((tab) => {
            const tabCount =
              tab.id === "unread"
                ? localNotifs.filter((n) => !n.isRead).length
                : filterNotifications(localNotifs, tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                data-ocid={`notifications.tab.${tab.id}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth shrink-0",
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary border border-primary/30 glow-emerald-subtle"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {tab.label}
                {tabCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold tabular-nums",
                      activeTab === tab.id
                        ? "bg-primary/30 text-primary"
                        : "bg-muted/80 text-muted-foreground",
                    )}
                  >
                    {tabCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading && localNotifs.length === 0 ? (
          <div className="space-y-3" data-ocid="notifications.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <LoadingSkeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <EmptyState
            icon={<BellOff className="h-7 w-7" />}
            title={
              activeTab === "all"
                ? "No notifications"
                : activeTab === "unread"
                  ? "No unread notifications"
                  : `No ${activeTab} notifications`
            }
            description={
              activeTab === "all"
                ? "You're all caught up! Check back later for updates."
                : `Switch to 'All' to see all your notifications.`
            }
            data-ocid="notifications.empty_state"
          />
        ) : (
          // Notification list
          <div className="space-y-2" data-ocid="notifications.list">
            {filtered.map((notif, idx) => (
              <div
                key={notif.notifId.toString()}
                data-ocid={`notifications.item.${idx + 1}`}
              >
                <NotifCardControlled
                  notif={notif}
                  isExpanded={expandedId === notif.notifId}
                  isDismissing={dismissingIds.has(notif.notifId)}
                  onToggleExpand={() =>
                    setExpandedId(
                      expandedId === notif.notifId ? null : notif.notifId,
                    )
                  }
                  onMarkRead={handleMarkRead}
                  onDismiss={handleDismiss}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear all confirmation dialog */}
      {showClearConfirm && (
        <ClearAllDialog
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </>
  );
}

// ─── Controlled card (no internal hooks for mutations) ────────────────────────
interface NotifCardControlledProps {
  notif: NotificationView;
  isExpanded: boolean;
  isDismissing: boolean;
  onToggleExpand: () => void;
  onMarkRead: (id: bigint) => void;
  onDismiss: (id: bigint) => void;
}

function NotifCardControlled({
  notif,
  isExpanded,
  isDismissing,
  onToggleExpand,
  onMarkRead,
  onDismiss,
}: NotifCardControlledProps) {
  const config = typeConfig[notif.notifType] ?? {
    Icon: Bell,
    badgeVariant: "muted" as const,
    label: "Alert",
    iconBg: "bg-muted/40",
    iconColor: "text-muted-foreground",
    iconBgRead: "bg-muted/40",
    iconColorRead: "text-muted-foreground",
  };
  const { Icon } = config;

  const handleClick = () => {
    onToggleExpand();
    if (!notif.isRead) onMarkRead(notif.notifId);
  };

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out overflow-hidden",
        isDismissing
          ? "opacity-0 scale-95 max-h-0 mb-0"
          : "opacity-100 scale-100 max-h-[600px]",
      )}
    >
      <Card
        variant={notif.isRead ? "default" : "glow"}
        className={cn(
          "transition-smooth cursor-pointer group select-none",
          !notif.isRead
            ? "border-primary/30 bg-card/90"
            : "border-border/60 bg-card/60",
          "hover:border-primary/20",
        )}
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon bubble */}
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-smooth",
                notif.isRead ? config.iconBgRead : config.iconBg,
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-smooth",
                  notif.isRead ? config.iconColorRead : config.iconColor,
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        notif.isRead
                          ? "text-muted-foreground"
                          : "text-foreground",
                      )}
                    >
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="inline-block h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_6px_1px_oklch(0.58_0.19_142/0.6)]" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-0.5 transition-smooth leading-relaxed",
                      isExpanded
                        ? "text-foreground/80"
                        : "text-muted-foreground line-clamp-2",
                    )}
                  >
                    {notif.message}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-300",
                      isExpanded && "rotate-180",
                    )}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notif.notifId);
                    }}
                    aria-label="Dismiss notification"
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-smooth"
                    data-ocid={`notifications.dismiss_button.${notif.notifId}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between mt-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={config.badgeVariant} size="sm">
                    {config.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notif.notifId);
                    }}
                    className="text-[11px] text-primary hover:underline transition-smooth shrink-0"
                    data-ocid={`notifications.mark_read_button.${notif.notifId}`}
                  >
                    Mark read
                  </button>
                )}
              </div>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        Date & Time
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5">
                        {new Date(
                          Number(notif.timestamp) / 1_000_000,
                        ).toLocaleString("en-GH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        Category
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5">
                        {config.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        Status
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5 font-medium",
                          notif.isRead
                            ? "text-muted-foreground"
                            : "text-primary",
                        )}
                      >
                        {notif.isRead ? "Read" : "Unread"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                        Ref ID
                      </p>
                      <p className="text-xs text-foreground/80 mt-0.5 font-mono">
                        #{notif.notifId.toString().padStart(6, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
