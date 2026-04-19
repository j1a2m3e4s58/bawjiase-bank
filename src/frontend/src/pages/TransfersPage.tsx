import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Share2,
  UserPlus,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountType } from "../backend";
import { Button } from "../components/BankButton";
import { Card, CardContent } from "../components/BankCard";
import { PageHeader } from "../components/layout/PageHeader";
import { useAccounts } from "../hooks/useAccounts";
import { useTransfer } from "../hooks/useTransactions";
import { formatCurrency } from "../lib/formatters";
import { sampleAccounts } from "../lib/sampleData";
import type { Transaction } from "../types";

// ─── Sample contacts ──────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  accountNumber: string;
  initials: string;
  color: string;
}

const sampleContacts: Contact[] = [
  {
    id: "c1",
    name: "Ama Mensah",
    accountNumber: "BCB-007-2024-0011",
    initials: "AM",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    id: "c2",
    name: "Kweku Asante",
    accountNumber: "BCB-003-2024-0058",
    initials: "KA",
    color: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "c3",
    name: "Abena Owusu",
    accountNumber: "BCB-005-2024-0089",
    initials: "AO",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    id: "c4",
    name: "Kofi Boateng",
    accountNumber: "BCB-009-2024-0023",
    initials: "KB",
    color: "bg-amber-500/20 text-amber-400",
  },
  {
    id: "c5",
    name: "Yaa Darko",
    accountNumber: "BCB-012-2024-0044",
    initials: "YD",
    color: "bg-rose-500/20 text-rose-400",
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Select Recipient", "Enter Amount", "Confirm", "Success"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={[
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary/20 border-2 border-primary text-primary glow-emerald-subtle"
                      : "bg-muted/40 border border-border text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={[
                  "text-[10px] font-medium hidden sm:block whitespace-nowrap",
                  active
                    ? "text-primary"
                    : done
                      ? "text-foreground/60"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-[2px] mx-1 rounded transition-all duration-500",
                  done ? "bg-primary" : "bg-border",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  initials,
  colorClass,
  size = "md",
}: { initials: string; colorClass: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "sm"
        ? "h-8 w-8 text-xs"
        : "h-11 w-11 text-sm";
  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Recipient =
  | Contact
  | {
      id: "manual";
      name: string;
      accountNumber: string;
      initials: string;
      color: string;
    };

type StepKey = 0 | 1 | 2 | 3;

// ─── Main component ───────────────────────────────────────────────────────────
export default function TransfersPage() {
  const navigate = useNavigate();
  const { data: accounts } = useAccounts();
  const transfer = useTransfer();
  const displayAccounts = accounts?.length ? accounts : sampleAccounts;
  const checkingAccount =
    displayAccounts.find((a) => a.accountType === AccountType.Checking) ??
    displayAccounts[0];
  const availableBalance = checkingAccount?.balance ?? 0n;

  // Step state
  const [step, setStep] = useState<StepKey>(0);
  const [direction, setDirection] = useState(1);

  // Step 1 - recipient
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAccount, setManualAccount] = useState("");
  const [recipientError, setRecipientError] = useState("");

  // Step 2 - amount
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [amountError, setAmountError] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Step 4 - success
  const [referenceNumber] = useState(
    () => `REF-${Date.now().toString(36).toUpperCase()}`,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTransaction, setConfirmedTransaction] =
    useState<Transaction | null>(null);

  const amountNum = Number.parseFloat(amount);
  const amountBigInt =
    Number.isNaN(amountNum) || amountNum <= 0
      ? 0n
      : BigInt(Math.round(amountNum * 100));

  const recipient: Recipient | null = manualMode
    ? manualName && manualAccount
      ? {
          id: "manual",
          name: manualName,
          accountNumber: manualAccount,
          initials: manualName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          color: "bg-primary/20 text-primary",
        }
      : null
    : selectedContact;

  // ── Navigation helpers ─────────────────────────────────────────────────────
  function goNext() {
    setDirection(1);
    setStep((s) => (s + 1) as StepKey);
  }
  function goBack() {
    setDirection(-1);
    setStep((s) => (s - 1) as StepKey);
  }

  // ── Step 1 validation ──────────────────────────────────────────────────────
  function handleStep1Next() {
    setRecipientError("");
    if (manualMode) {
      if (!manualName.trim()) {
        setRecipientError("Please enter the recipient's name.");
        return;
      }
      if (!manualAccount.trim()) {
        setRecipientError("Please enter an account number.");
        return;
      }
    } else if (!selectedContact) {
      setRecipientError("Please select a recipient or enter details manually.");
      return;
    }
    goNext();
  }

  // ── Step 2 validation ──────────────────────────────────────────────────────
  function handleStep2Next() {
    setAmountError("");
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setAmountError("Please enter a valid amount.");
      return;
    }
    if (amountBigInt > availableBalance) {
      setAmountError("Amount exceeds your available balance.");
      return;
    }
    goNext();
  }

  // ── Step 3 confirm ─────────────────────────────────────────────────────────
  async function handleConfirm() {
    setPinError("");
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Enter a 4 to 6 digit demo PIN to confirm.");
      return;
    }

    if (!checkingAccount || !recipient) {
      toast.error("Transfer details are incomplete.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fallbackRecipientId =
        recipient.id === "manual"
          ? [...recipient.accountNumber].reduce(
              (sum, char) => sum + char.charCodeAt(0),
              0,
            )
          : Number.parseInt(recipient.id.replace(/\D/g, ""), 10) + 10;
      const result = await transfer.mutateAsync({
        fromAccountId: checkingAccount.accountId,
        toAccountId: BigInt(fallbackRecipientId || 99),
        amount: amountBigInt,
        description: description || `Transfer to ${recipient.name}`,
      });
      setConfirmedTransaction(result.transaction);
      setDirection(1);
      setStep(3);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to complete transfer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setStep(0);
    setDirection(1);
    setSelectedContact(null);
    setManualMode(false);
    setManualName("");
    setManualAccount("");
    setAmount("");
    setDescription("");
    setPin("");
    setAmountError("");
    setRecipientError("");
    setPinError("");
    setConfirmedTransaction(null);
  }

  // ── Slide animation variants ───────────────────────────────────────────────
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="max-w-lg mx-auto" data-ocid="transfers.page">
      <PageHeader
        title="Send Money"
        subtitle="Transfer funds to anyone, instantly"
      />

      <StepIndicator current={step} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: "easeInOut" }}
        >
          {/* ── STEP 0: Select Recipient ─────────────────────────────────── */}
          {step === 0 && (
            <Card variant="default" data-ocid="transfers.step1.card">
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-foreground">
                    Select Recipient
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setManualMode(!manualMode);
                      setRecipientError("");
                    }}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    data-ocid="transfers.manual_entry_toggle"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    {manualMode ? "Choose from contacts" : "Enter manually"}
                  </button>
                </div>

                {!manualMode ? (
                  <div
                    className="grid grid-cols-1 gap-2"
                    data-ocid="transfers.contacts_list"
                  >
                    {sampleContacts.map((c, i) => {
                      const isSelected = selectedContact?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedContact(c);
                            setRecipientError("");
                          }}
                          className={[
                            "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-primary/60 bg-primary/10 glow-emerald-subtle"
                              : "border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/40",
                          ].join(" ")}
                          data-ocid={`transfers.contact.item.${i + 1}`}
                          aria-pressed={isSelected}
                        >
                          <Avatar initials={c.initials} colorClass={c.color} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.accountNumber}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4" data-ocid="transfers.manual_form">
                    <div>
                      <label
                        className="block text-xs font-medium text-muted-foreground mb-1.5"
                        htmlFor="manual-name"
                      >
                        Recipient Name
                      </label>
                      <input
                        id="manual-name"
                        type="text"
                        placeholder="Full name"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                        data-ocid="transfers.manual_name_input"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-muted-foreground mb-1.5"
                        htmlFor="manual-account"
                      >
                        Account Number
                      </label>
                      <input
                        id="manual-account"
                        type="text"
                        placeholder="e.g. BCB-007-2024-0011"
                        value={manualAccount}
                        onChange={(e) => setManualAccount(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                        data-ocid="transfers.manual_account_input"
                      />
                    </div>
                  </div>
                )}

                {recipientError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="transfers.recipient.field_error"
                  >
                    {recipientError}
                  </p>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleStep1Next}
                  data-ocid="transfers.step1.next_button"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 1: Enter Amount ─────────────────────────────────────── */}
          {step === 1 && recipient && (
            <Card variant="default" data-ocid="transfers.step2.card">
              <CardContent className="space-y-6">
                {/* Recipient preview */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/20 border border-border">
                  <Avatar
                    initials={recipient.initials}
                    colorClass={recipient.color}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Sending to</p>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {recipient.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {recipient.accountNumber}
                  </span>
                </div>

                {/* Large amount input */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Amount
                  </p>
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="text-2xl font-display font-bold text-primary">
                      GHGHS
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setAmountError("");
                      }}
                      className="w-40 text-center text-4xl font-display font-bold text-foreground bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      data-ocid="transfers.amount_input"
                      aria-label="Transfer amount in GHS"
                    />
                  </div>
                  <div className="h-[2px] w-32 mx-auto bg-border rounded" />
                  <p className="text-xs text-muted-foreground">
                    Available:{" "}
                    <span className="text-foreground font-medium">
                      {formatCurrency(availableBalance)}
                    </span>
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  {([50, 100, 200, 500] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setAmount(q.toString());
                        setAmountError("");
                      }}
                      className={[
                        "flex-1 py-2 rounded-lg border text-xs font-medium transition-all duration-200",
                        amount === q.toString()
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-primary",
                      ].join(" ")}
                      data-ocid={`transfers.quick_amount.${q}_button`}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                    htmlFor="description"
                  >
                    Note{" "}
                    <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <input
                    id="description"
                    type="text"
                    placeholder="What's this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                    data-ocid="transfers.description_input"
                  />
                </div>

                {amountError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="transfers.amount.field_error"
                  >
                    {amountError}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={goBack}
                    data-ocid="transfers.step2.back_button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleStep2Next}
                    data-ocid="transfers.step2.next_button"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 2: Confirm ──────────────────────────────────────────── */}
          {step === 2 && recipient && (
            <Card variant="default" data-ocid="transfers.step3.card">
              <CardContent className="space-y-5">
                <h2 className="font-display font-semibold text-foreground">
                  Review Transfer
                </h2>

                {/* Summary card */}
                <div className="rounded-xl bg-muted/20 border border-border overflow-hidden">
                  {/* Recipient row */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Avatar
                      initials={recipient.initials}
                      colorClass={recipient.color}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="font-semibold text-sm text-foreground truncate">
                        {recipient.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {recipient.accountNumber}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="p-4 border-b border-border text-center">
                    <p className="text-3xl font-display font-bold text-primary">
                      {formatCurrency(amountBigInt)}
                    </p>
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="divide-y divide-border">
                    {[
                      {
                        label: "Transaction Fee",
                        value: "GHGHS 0.00",
                        highlight: false,
                      },
                      {
                        label: "Total Deducted",
                        value: formatCurrency(amountBigInt),
                        highlight: true,
                      },
                      {
                        label: "Estimated Arrival",
                        value: "Instantly",
                        icon: <Clock className="h-3 w-3 text-primary" />,
                        highlight: false,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-xs text-muted-foreground">
                          {row.label}
                        </span>
                        <span
                          className={`text-xs font-medium flex items-center gap-1 ${row.highlight ? "text-primary" : "text-foreground"}`}
                        >
                          {"icon" in row && row.icon}
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                    htmlFor="transfer-pin"
                  >
                    Demo PIN
                  </label>
                  <input
                    id="transfer-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ""));
                      setPinError("");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth tracking-widest"
                    data-ocid="transfers.pin_input"
                  />
                  {pinError && (
                    <p className="mt-1 text-xs text-destructive">{pinError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={goBack}
                    data-ocid="transfers.step3.back_button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 glow-emerald-subtle"
                    onClick={handleConfirm}
                    loading={isSubmitting}
                    data-ocid="transfers.confirm_button"
                  >
                    {!isSubmitting && <Zap className="h-4 w-4" />}
                    {isSubmitting ? "Processing..." : "Confirm & Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── STEP 3: Success ──────────────────────────────────────────── */}
          {step === 3 && recipient && (
            <div
              className="flex flex-col items-center gap-6 py-6"
              data-ocid="transfers.success_state"
            >
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative"
              >
                <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center glow-emerald">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                />
              </motion.div>

              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-center"
              >
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Transfer Successful!
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Your money is on its way
                </p>
              </motion.div>

              {/* Receipt card */}
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="w-full"
              >
                <Card variant="glow">
                  <CardContent className="space-y-0 p-0">
                    <div className="flex items-center gap-3 p-4 border-b border-border">
                      <Avatar
                        initials={recipient.initials}
                        colorClass={recipient.color}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Sent to</p>
                        <p className="font-semibold text-sm text-foreground truncate">
                          {recipient.name}
                        </p>
                      </div>
                      <p className="font-display font-bold text-primary text-lg">
                        {formatCurrency(amountBigInt)}
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {[
                        {
                          label: "Reference",
                          value:
                            confirmedTransaction?.referenceNumber ??
                            referenceNumber,
                        },
                        { label: "Status", value: "Completed" },
                        {
                          label: "Date",
                          value: new Date().toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <span className="text-xs text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="w-full flex flex-col gap-3"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    toast.success("Receipt copied to clipboard!", {
                      description: `Ref: ${
                        confirmedTransaction?.referenceNumber ?? referenceNumber
                      }`,
                    });
                  }}
                  data-ocid="transfers.share_receipt_button"
                >
                  <Share2 className="h-4 w-4" />
                  Share Receipt
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full glow-emerald-subtle"
                  onClick={reset}
                  data-ocid="transfers.new_transfer_button"
                >
                  Make Another Transfer
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => navigate({ to: "/transactions" })}
                  data-ocid="transfers.view_transactions_button"
                >
                  View Transactions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
