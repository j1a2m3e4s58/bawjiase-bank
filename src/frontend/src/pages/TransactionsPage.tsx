import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Receipt,
  Search,
  Send,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TransactionCategory, TransactionStatus } from "../backend";
import { Badge } from "../components/BankBadge";
import { Card } from "../components/BankCard";
import { EmptyState } from "../components/BankEmptyState";
import { LoadingSkeleton } from "../components/BankLoading";
import { PageHeader } from "../components/layout/PageHeader";
import { useAccounts } from "../hooks/useAccounts";
import { useTransactions } from "../hooks/useTransactions";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatTime,
} from "../lib/formatters";
import { sampleAccounts, sampleTransactions } from "../lib/sampleData";
import type { Transaction } from "../types";

// ── Category config ──────────────────────────────────────────────────────────

const categoryConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    iconColor: string;
    label: string;
  }
> = {
  [TransactionCategory.Deposit]: {
    icon: ArrowDownLeft,
    bg: "bg-emerald-500/15 border border-emerald-500/20",
    iconColor: "text-emerald-400",
    label: "Deposit",
  },
  [TransactionCategory.Withdrawal]: {
    icon: ArrowUpRight,
    bg: "bg-red-500/15 border border-red-500/20",
    iconColor: "text-red-400",
    label: "Withdrawal",
  },
  [TransactionCategory.Transfer]: {
    icon: Send,
    bg: "bg-blue-500/15 border border-blue-500/20",
    iconColor: "text-blue-400",
    label: "Transfer",
  },
  [TransactionCategory.Payment]: {
    icon: ShoppingCart,
    bg: "bg-yellow-500/15 border border-yellow-500/20",
    iconColor: "text-yellow-400",
    label: "Payment",
  },
};

// ── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  {
    variant: "success" | "warning" | "danger";
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  [TransactionStatus.Completed]: {
    variant: "success",
    icon: CheckCircle2,
    label: "Completed",
  },
  [TransactionStatus.Pending]: {
    variant: "warning",
    icon: Clock,
    label: "Pending",
  },
  [TransactionStatus.Failed]: {
    variant: "danger",
    icon: XCircle,
    label: "Failed",
  },
};

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Deposit",
  "Payment",
  "Transfer",
  "Withdrawal",
] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const DATE_RANGES = ["All time", "Today", "This week", "This month"] as const;
type DateRangeFilter = (typeof DATE_RANGES)[number];

const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

function isCredit(tx: Transaction): boolean {
  return (
    tx.category === TransactionCategory.Deposit ||
    (!tx.fromAccount && !!tx.toAccount)
  );
}

function matchesDateRange(ts: bigint, range: DateRangeFilter): boolean {
  if (range === "All time") return true;
  const ms = Number(ts) / 1_000_000;
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  if (range === "Today") return ms >= startOfDay.getTime();
  if (range === "This week") return ms >= now - 7 * 86_400_000;
  if (range === "This month") return ms >= now - 30 * 86_400_000;
  return true;
}

// ── Receipt Row helper ───────────────────────────────────────────────────────

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-xs font-medium text-foreground truncate text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Receipt Drawer ───────────────────────────────────────────────────────────

interface ReceiptDrawerProps {
  tx: Transaction | null;
  onClose: () => void;
}

function ReceiptDrawer({ tx, onClose }: ReceiptDrawerProps) {
  if (!tx) return null;

  const credit = isCredit(tx);
  const cat =
    categoryConfig[tx.category] ?? categoryConfig[TransactionCategory.Transfer];
  const status =
    statusConfig[tx.status] ?? statusConfig[TransactionStatus.Completed];
  const StatusIcon = status.icon;
  const CatIcon = cat.icon;

  function handleDownload() {
    toast.success("Receipt downloaded", {
      description: `${tx!.referenceNumber}.pdf`,
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm cursor-default w-full h-full"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close receipt"
        data-ocid="transactions.receipt_backdrop"
      />

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center animate-slide-up"
        data-ocid="transactions.receipt_dialog"
      >
        <div className="relative w-full md:max-w-md mx-auto rounded-t-3xl md:rounded-2xl bg-card border border-border shadow-elevated overflow-hidden">
          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}
              >
                <CatIcon className={`h-5 w-5 ${cat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{cat.label}</p>
                <p className="text-sm font-semibold text-foreground font-display truncate max-w-[200px]">
                  {tx.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
              data-ocid="transactions.receipt_close_button"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Amount hero */}
          <div className="px-6 py-6 text-center border-b border-border/60 bg-muted/10">
            <p
              className={`text-3xl font-display font-bold tracking-tight ${credit ? "text-primary" : "text-foreground"}`}
            >
              {credit ? "+" : "−"}
              {formatCurrency(tx.amount)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <StatusIcon
                className={`h-4 w-4 ${
                  status.variant === "success"
                    ? "text-primary"
                    : status.variant === "warning"
                      ? "text-yellow-400"
                      : "text-destructive"
                }`}
              />
              <Badge variant={status.variant} size="md">
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 space-y-3.5">
            <ReceiptRow label="Reference" value={tx.referenceNumber} mono />
            <ReceiptRow label="Date" value={formatDate(tx.timestamp)} />
            <ReceiptRow label="Time" value={formatTime(tx.timestamp)} />
            {tx.fromAccount && (
              <ReceiptRow
                label="From Account"
                value={`Account #${tx.fromAccount.toString()}`}
              />
            )}
            {tx.toAccount && (
              <ReceiptRow
                label="To Account"
                value={`Account #${tx.toAccount.toString()}`}
              />
            )}
            <ReceiptRow label="Category" value={cat.label} />
            <ReceiptRow
              label="Transaction ID"
              value={`TXN-${tx.txId.toString().padStart(6, "0")}`}
              mono
            />
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-smooth hover:opacity-90 glow-emerald-subtle"
              data-ocid="transactions.receipt_download_button"
            >
              <Download className="h-4 w-4" />
              Download Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-muted-foreground font-medium text-sm transition-smooth hover:text-foreground"
              data-ocid="transactions.receipt_cancel_button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Summary Bar ──────────────────────────────────────────────────────────────

interface SummaryBarProps {
  transactions: Transaction[];
}

function SummaryBar({ transactions }: SummaryBarProps) {
  const now = Date.now();
  const monthStart = now - 30 * 86_400_000;

  const monthTxs = transactions.filter(
    (tx) => Number(tx.timestamp) / 1_000_000 >= monthStart,
  );

  const income = monthTxs
    .filter(isCredit)
    .reduce((s, tx) => s + Number(tx.amount), 0);

  const spent = monthTxs
    .filter((tx) => !isCredit(tx))
    .reduce((s, tx) => s + Number(tx.amount), 0);

  const net = income - spent;

  return (
    <div
      className="grid grid-cols-3 gap-3"
      data-ocid="transactions.summary_bar"
    >
      <SummaryCard
        label="Income"
        value={formatCurrency(BigInt(Math.round(income)))}
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        colorClass="text-primary"
      />
      <SummaryCard
        label="Spent"
        value={formatCurrency(BigInt(Math.round(spent)))}
        icon={<TrendingDown className="h-4 w-4 text-red-400" />}
        colorClass="text-red-400"
      />
      <SummaryCard
        label="Net"
        value={formatCurrency(BigInt(Math.round(Math.abs(net))))}
        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        colorClass="text-foreground"
        prefix={net >= 0 ? "+" : "−"}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  colorClass,
  prefix,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  prefix?: string;
}) {
  return (
    <Card variant="default" className="p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-display font-bold tracking-tight truncate ${colorClass}`}
      >
        {prefix}
        {value}
      </p>
    </Card>
  );
}

// ── Transaction Row ──────────────────────────────────────────────────────────

interface TxRowProps {
  tx: Transaction;
  index: number;
  onClick: () => void;
}

function TxRow({ tx, index, onClick }: TxRowProps) {
  const credit = isCredit(tx);
  const cat =
    categoryConfig[tx.category] ?? categoryConfig[TransactionCategory.Transfer];
  const status =
    statusConfig[tx.status] ?? statusConfig[TransactionStatus.Completed];
  const Icon = cat.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`transactions.item.${index}`}
      className="w-full text-left"
    >
      {/* Desktop row */}
      <div className="hidden md:flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-muted/30 transition-smooth group border border-transparent hover:border-border/60">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}
        >
          <Icon className={`h-4 w-4 ${cat.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {tx.description}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {tx.referenceNumber}
          </p>
        </div>
        <div className="text-xs text-muted-foreground shrink-0 hidden lg:block w-28 text-right">
          {formatRelativeTime(tx.timestamp)}
        </div>
        <div className="shrink-0">
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>
        <div
          className={`shrink-0 text-sm font-semibold font-display w-28 text-right ${credit ? "text-primary" : "text-foreground"}`}
        >
          {credit ? "+" : "−"}
          {formatCurrency(tx.amount)}
        </div>
      </div>

      {/* Mobile card */}
      <Card
        variant="default"
        className="md:hidden p-4 hover:border-primary/20 active:scale-[0.99] transition-smooth"
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}
          >
            <Icon className={`h-5 w-5 ${cat.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {tx.description}
              </p>
              <p
                className={`text-sm font-semibold font-display shrink-0 ${credit ? "text-primary" : "text-foreground"}`}
              >
                {credit ? "+" : "−"}
                {formatCurrency(tx.amount)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(tx.timestamp)}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { data: accounts } = useAccounts();
  const displayAccounts = accounts?.length ? accounts : sampleAccounts;
  const activeAccountId = displayAccounts[0]?.accountId ?? null;
  const { data: txPage, isLoading } = useTransactions(activeAccountId);
  const allTxs: Transaction[] = txPage?.transactions?.length
    ? txPage.transactions
    : sampleTransactions;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("All time");
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const filtered = useMemo(() => {
    return allTxs.filter((tx) => {
      const matchSearch =
        search === "" ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || tx.category === category;
      const matchDate = matchesDateRange(tx.timestamp, dateRange);
      return matchSearch && matchCat && matchDate;
    });
  }, [allTxs, search, category, dateRange]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paginated.length;

  const activeFilters =
    (category !== "All" ? 1 : 0) + (dateRange !== "All time" ? 1 : 0);

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      <PageHeader
        title="Transactions"
        subtitle={`${allTxs.length} total transactions`}
      />

      {/* Summary bar */}
      {!isLoading && <SummaryBar transactions={allTxs} />}

      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by description or reference…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            data-ocid="transactions.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              data-ocid="transactions.search_clear_button"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Filter className="h-3.5 w-3.5" />
            {activeFilters > 0 && (
              <Badge variant="default" size="sm" count={activeFilters} />
            )}
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowCategoryMenu(!showCategoryMenu);
                setShowDateMenu(false);
              }}
              data-ocid="transactions.category_select"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                category !== "All"
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {showCategoryMenu && (
              <div className="absolute top-full mt-1.5 left-0 z-20 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden min-w-[140px]">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setShowCategoryMenu(false);
                      setPage(1);
                    }}
                    data-ocid={`transactions.category.${c.toLowerCase()}_tab`}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-smooth ${
                      category === c
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date range dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDateMenu(!showDateMenu);
                setShowCategoryMenu(false);
              }}
              data-ocid="transactions.date_range_select"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                dateRange !== "All time"
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {dateRange}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {showDateMenu && (
              <div className="absolute top-full mt-1.5 left-0 z-20 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden min-w-[140px]">
                {DATE_RANGES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setDateRange(r);
                      setShowDateMenu(false);
                      setPage(1);
                    }}
                    data-ocid={`transactions.date.${r.toLowerCase().replace(/\s+/g, "_")}_tab`}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-smooth ${
                      dateRange === r
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setDateRange("All time");
                setPage(1);
              }}
              data-ocid="transactions.clear_filters_button"
              className="text-xs text-muted-foreground hover:text-foreground transition-smooth underline underline-offset-2"
            >
              Clear
            </button>
          )}

          {/* Desktop count */}
          <span className="text-xs text-muted-foreground ml-auto hidden md:block">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Desktop table header */}
      {!isLoading && filtered.length > 0 && (
        <div className="hidden md:flex items-center gap-4 px-4 pb-1 border-b border-border/50">
          <div className="w-9 shrink-0" />
          <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Description
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden lg:block w-28 text-right">
            Date
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">
            Status
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-28 text-right shrink-0">
            Amount
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i} className="h-[72px] md:h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title="No transactions found"
          description={
            search || activeFilters > 0
              ? "Try adjusting your search or filters."
              : "Your transactions will appear here."
          }
          data-ocid="transactions.empty_state"
        />
      ) : (
        <>
          <div
            className="space-y-1.5 md:space-y-0.5"
            data-ocid="transactions.list"
          >
            {paginated.map((tx, idx) => (
              <TxRow
                key={tx.txId.toString()}
                tx={tx}
                index={idx + 1}
                onClick={() => setSelectedTx(tx)}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                data-ocid="transactions.load_more_button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted/40 border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth"
              >
                Load more
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Receipt Drawer */}
      <ReceiptDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />

      {/* Close dropdowns on outside click */}
      {(showCategoryMenu || showDateMenu) && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default w-full h-full"
          onClick={() => {
            setShowCategoryMenu(false);
            setShowDateMenu(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowCategoryMenu(false);
              setShowDateMenu(false);
            }
          }}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}
