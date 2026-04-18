import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  PlusCircle,
  Receipt,
  Send,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { AccountType, TransactionCategory } from "../backend";
import { Button } from "../components/BankButton";
import { Card, CardContent } from "../components/BankCard";
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
import { useAppStore } from "../store/useAppStore";
import type { Transaction } from "../types";

// ─── Category icon map ────────────────────────────────────────────────────────
const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  [TransactionCategory.Payment]: ShoppingCart,
  [TransactionCategory.Transfer]: Send,
  [TransactionCategory.Deposit]: ArrowDownLeft,
  [TransactionCategory.Withdrawal]: Wallet,
};

const categoryColors: Record<string, string> = {
  [TransactionCategory.Payment]: "#10b981",
  [TransactionCategory.Transfer]: "#0ea5e9",
  [TransactionCategory.Deposit]: "#22d3ee",
  [TransactionCategory.Withdrawal]: "#f59e0b",
};

// ─── Balance trend data (7 days) ─────────────────────────────────────────────
function buildTrend(balance: bigint): { day: string; value: number }[] {
  const base = Number(balance) / 100;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    value: Math.round(base * (0.92 + i * 0.012 + Math.sin(i) * 0.008)),
  }));
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────
function TransactionModal({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!tx) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [tx, onClose]);

  if (!tx) return null;
  const isCredit = !tx.fromAccount;
  const Icon = categoryIcons[tx.category] ?? Send;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-transparent w-full max-w-none m-0"
      data-ocid="dashboard.transaction_detail.dialog"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClose()}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header strip */}
        <div className="relative p-6 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-border">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth"
            aria-label="Close"
            data-ocid="dashboard.transaction_detail.close_button"
          >
            <X className="h-4 w-4" />
          </button>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 ${
              isCredit
                ? "bg-primary/20 border border-primary/30"
                : "bg-muted/60 border border-border"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${isCredit ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <p className="font-display font-bold text-xl text-foreground leading-tight">
            {tx.description}
          </p>
          <p
            className={`font-display font-bold text-3xl mt-1 ${isCredit ? "text-primary" : "text-foreground"}`}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(tx.amount)}
          </p>
        </div>

        {/* Details grid */}
        <div className="p-5 space-y-3">
          {[
            { label: "Category", value: tx.category },
            { label: "Status", value: tx.status, badge: true },
            { label: "Date", value: formatDate(tx.timestamp) },
            { label: "Time", value: formatTime(tx.timestamp) },
            { label: "Reference", value: tx.referenceNumber, mono: true },
            {
              label: "Direction",
              value: isCredit ? "Credit (Incoming)" : "Debit (Outgoing)",
            },
          ].map(({ label, value, badge, mono }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
              {badge ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                  {value}
                </span>
              ) : (
                <span
                  className={`text-sm font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}
                >
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={onClose}
            data-ocid="dashboard.transaction_detail.cancel_button"
          >
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Mini Donut Chart ─────────────────────────────────────────────────────────
function SpendingDonut({ transactions }: { transactions: Transaction[] }) {
  const categories = [
    TransactionCategory.Payment,
    TransactionCategory.Transfer,
    TransactionCategory.Deposit,
    TransactionCategory.Withdrawal,
  ];
  const data = categories
    .map((cat) => ({
      name: cat,
      value: transactions
        .filter((tx) => tx.category === cat)
        .reduce((sum, tx) => sum + Number(tx.amount) / 100, 0),
    }))
    .filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={categoryColors[entry.name] ?? "#888"}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-display font-bold text-foreground">
            {formatCurrency(BigInt(Math.round(total * 100)))}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 w-full">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: categoryColors[entry.name] ?? "#888" }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Balance Line Chart ───────────────────────────────────────────────────────
function BalanceTrendChart({ balance }: { balance: bigint }) {
  const data = buildTrend(balance);
  return (
    <div className="h-16 w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor="oklch(0.58 0.19 142)"
                stopOpacity={0.6}
              />
              <stop
                offset="100%"
                stopColor="oklch(0.7 0.1 185)"
                stopOpacity={1}
              />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: "oklch(0.16 0 0)",
              border: "1px solid oklch(0.22 0 0)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "oklch(0.96 0 0)",
            }}
            formatter={(v: number) => [`GH₵ ${v.toLocaleString()}`, ""]}
            labelFormatter={(l: string) => l}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#lineGrad)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "oklch(0.58 0.19 142)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: bigint;
  change: string;
  positive: boolean;
}) {
  return (
    <Card variant="default" className="p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-display font-bold text-lg text-foreground leading-tight">
        {formatCurrency(value)}
      </p>
      <p
        className={`text-xs mt-1 font-medium ${positive ? "text-primary" : "text-destructive"}`}
      >
        {change}
      </p>
    </Card>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickActionBtn({
  label,
  icon: Icon,
  onClick,
  ocid,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className="flex flex-col items-center gap-2.5 p-3 rounded-2xl group hover:bg-primary/5 transition-smooth"
    >
      <div className="h-13 w-13 rounded-2xl bg-muted/40 border border-border flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:glow-emerald-subtle transition-smooth">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth" />
      </div>
      <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-smooth font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { setAccounts, setTransactions } = useAppStore();

  const [activeAccountIdx, setActiveAccountIdx] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const displayAccounts = accounts?.length ? accounts : sampleAccounts;
  const activeAccountId = displayAccounts[activeAccountIdx]?.accountId ?? null;
  const { data: txPage, isLoading: txLoading } =
    useTransactions(activeAccountId);
  const displayTxs = txPage?.transactions?.length
    ? txPage.transactions
    : sampleTransactions;

  useEffect(() => {
    if (!accounts?.length) setAccounts(sampleAccounts);
  }, [accounts, setAccounts]);

  useEffect(() => {
    if (!txPage?.transactions?.length) setTransactions(sampleTransactions);
  }, [txPage, setTransactions]);

  const activeAccount = displayAccounts[activeAccountIdx];
  const activeBalance = activeAccount?.balance ?? 0n;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const currentDate = new Date().toLocaleDateString("en-GH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Spending stats from sample transactions
  const monthlyIncome = displayTxs
    .filter((tx) => !tx.fromAccount)
    .reduce((s, tx) => s + tx.amount, 0n);
  const monthlySpend = displayTxs
    .filter((tx) => !!tx.fromAccount)
    .reduce((s, tx) => s + tx.amount, 0n);
  const savingsRate =
    monthlyIncome > 0n
      ? Math.round(
          ((Number(monthlyIncome) - Number(monthlySpend)) /
            Number(monthlyIncome)) *
            100,
        )
      : 0;

  const handleQuickAction = (label: string) => {
    if (label === "Send Money") {
      navigate({ to: "/transfers" });
      return;
    }
    toast.success(`${label}`, {
      description: "Feature coming soon — stay tuned!",
      duration: 3500,
    });
  };

  return (
    <>
      <div className="space-y-6 pb-4">
        {/* ── Greeting ───────────────────────────────────────────────── */}
        <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
          <h2 className="font-display font-bold text-2xl text-foreground leading-tight">
            {greeting}, Kwame,
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">{currentDate}</p>
        </div>

        {/* ── Hero Balance Card ──────────────────────────────────────── */}
        <div className="animate-slide-up" style={{ animationDelay: "60ms" }}>
          {/* Account switcher tabs */}
          {!accountsLoading && (
            <div
              className="flex gap-2 mb-3"
              data-ocid="dashboard.account_switcher"
            >
              {displayAccounts.map((acc, idx) => {
                const isChecking = acc.accountType === AccountType.Checking;
                const isActive = idx === activeAccountIdx;
                return (
                  <button
                    key={acc.accountId.toString()}
                    type="button"
                    onClick={() => setActiveAccountIdx(idx)}
                    data-ocid={`dashboard.account_tab.${idx + 1}`}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-smooth border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary glow-emerald-subtle"
                        : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {isChecking ? "Checking" : "Savings"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Hero card */}
          <Card
            variant="glow"
            className="relative overflow-hidden"
            data-ocid="dashboard.balance_card"
          >
            {/* Background decoration */}
            <div
              className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/8 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/6 blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"
              aria-hidden="true"
            />

            <CardContent className="relative pt-5">
              {accountsLoading ? (
                <div className="space-y-2">
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-10 w-48" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {activeAccount?.accountType === AccountType.Checking
                          ? "Checking"
                          : "Savings"}{" "}
                        Balance
                      </p>
                      <p className="font-display font-bold text-4xl text-foreground tracking-tight">
                        {formatCurrency(activeBalance)}
                      </p>
                      <p className="text-primary text-sm mt-1 font-medium">
                        +2.3% this month
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-muted-foreground/70">
                        {activeAccount?.accountNumber?.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Balance trend sparkline */}
                  <BalanceTrendChart balance={activeBalance} />

                  {/* Quick action buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => navigate({ to: "/transfers" })}
                      data-ocid="dashboard.send_money_button"
                    >
                      <Send className="h-4 w-4" />
                      Send Money
                    </Button>
                    <Button
                      variant="glass"
                      size="md"
                      className="flex-1"
                      onClick={() => handleQuickAction("Pay Bills")}
                      data-ocid="dashboard.pay_bills_button"
                    >
                      <Receipt className="h-4 w-4" />
                      Pay Bills
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Desktop 2-col grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Quick Actions + Recent Transactions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "120ms" }}
            >
              <PageHeader title="Quick Actions" />
              <Card variant="default" className="p-2">
                <div
                  className="grid grid-cols-5 gap-1"
                  data-ocid="dashboard.quick_actions"
                >
                  <QuickActionBtn
                    label="Send Money"
                    icon={ArrowUpRight}
                    onClick={() => handleQuickAction("Send Money")}
                    ocid="dashboard.quick_action.send_button"
                  />
                  <QuickActionBtn
                    label="Request Money"
                    icon={ArrowDownLeft}
                    onClick={() => handleQuickAction("Request Money")}
                    ocid="dashboard.quick_action.request_button"
                  />
                  <QuickActionBtn
                    label="Pay Bills"
                    icon={Receipt}
                    onClick={() => handleQuickAction("Pay Bills")}
                    ocid="dashboard.quick_action.bills_button"
                  />
                  <QuickActionBtn
                    label="Card Controls"
                    icon={CreditCard}
                    onClick={() => handleQuickAction("Card Controls")}
                    ocid="dashboard.quick_action.cards_button"
                  />
                  <QuickActionBtn
                    label="Top Up"
                    icon={PlusCircle}
                    onClick={() => handleQuickAction("Top Up")}
                    ocid="dashboard.quick_action.topup_button"
                  />
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "180ms" }}
            >
              <PageHeader
                title="Recent Transactions"
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: "/transactions" })}
                    data-ocid="dashboard.view_all_transactions_button"
                  >
                    View all
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                }
              />

              {txLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div
                  className="space-y-2"
                  data-ocid="dashboard.transactions_list"
                >
                  {displayTxs.slice(0, 5).map((tx, idx) => {
                    const isCredit = !tx.fromAccount;
                    const Icon = categoryIcons[tx.category] ?? ShoppingBag;
                    return (
                      <button
                        type="button"
                        key={tx.txId.toString()}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/25 hover:bg-primary/5 transition-smooth text-left group"
                        data-ocid={`dashboard.transaction_item.${idx + 1}`}
                        onClick={() => setSelectedTx(tx)}
                      >
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-smooth ${
                            isCredit
                              ? "bg-primary/15 border border-primary/25 group-hover:bg-primary/25"
                              : "bg-muted/50 border border-border group-hover:bg-muted/80"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isCredit
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.category} · {formatRelativeTime(tx.timestamp)}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold font-display shrink-0 ${
                            isCredit ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Spending Overview + Stats */}
          <div className="space-y-6">
            {/* Spending Overview */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "240ms" }}
            >
              <PageHeader title="Spending Overview" />
              <Card variant="default" className="p-5">
                {txLoading ? (
                  <LoadingSkeleton className="h-48" />
                ) : (
                  <SpendingDonut transactions={displayTxs} />
                )}
              </Card>
            </div>

            {/* Stats Row */}
            <div
              className="animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <PageHeader title="Monthly Summary" />
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                <StatCard
                  label="Monthly Income"
                  value={monthlyIncome}
                  change="+12.4% vs last month"
                  positive={true}
                />
                <StatCard
                  label="Monthly Spending"
                  value={monthlySpend}
                  change="-3.1% vs last month"
                  positive={false}
                />
                <StatCard
                  label="Savings Rate"
                  value={BigInt(Math.max(0, savingsRate))}
                  change={`${savingsRate}% of income saved`}
                  positive={savingsRate > 0}
                />
              </div>
            </div>

            {/* All Accounts Overview */}
            {!accountsLoading && (
              <div
                className="animate-slide-up"
                style={{ animationDelay: "360ms" }}
              >
                <PageHeader
                  title="My Accounts"
                  subtitle="Tap to view transactions"
                />
                <div className="space-y-3">
                  {displayAccounts.map((acc, idx) => {
                    const isChecking = acc.accountType === AccountType.Checking;
                    const isActive = idx === activeAccountIdx;
                    return (
                      <button
                        type="button"
                        key={acc.accountId.toString()}
                        onClick={() => {
                          setActiveAccountIdx(idx);
                          navigate({ to: "/transactions" });
                        }}
                        data-ocid={`dashboard.account_card.${isChecking ? "checking" : "savings"}`}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-smooth text-left ${
                          isActive
                            ? "bg-primary/10 border-primary/30 glow-emerald-subtle"
                            : "bg-card border-border hover:border-primary/20 hover:bg-primary/5"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? "bg-primary/20" : "bg-muted/50"
                          }`}
                        >
                          {isChecking ? (
                            <CreditCard
                              className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                            />
                          ) : (
                            <TrendingUp
                              className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {isChecking
                              ? "Checking Account"
                              : "Savings Account"}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
                            {acc.accountNumber}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-sm text-foreground">
                            {formatCurrency(acc.balance)}
                          </p>
                          <p className="text-[10px] text-primary">+2.3%</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction detail modal */}
      <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
}
