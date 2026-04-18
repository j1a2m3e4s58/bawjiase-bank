import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  KeyRound,
  Languages,
  Laptop,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  Plus,
  Shield,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  TriangleAlert,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountType } from "../backend";
import { Badge } from "../components/BankBadge";
import { Button } from "../components/BankButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/BankCard";
import { Modal } from "../components/BankModal";
import { PageHeader } from "../components/layout/PageHeader";
import { useAccounts, useCreateAccount } from "../hooks/useAccounts";
import {
  formatCurrency,
  formatDate,
  maskAccountNumber,
} from "../lib/formatters";
import { sampleAccounts } from "../lib/sampleData";
import { applyTheme, getStoredTheme, type ThemeMode } from "../lib/theme";

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
  "data-ocid": dataOcid,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      data-ocid={dataOcid}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
        enabled
          ? "bg-primary glow-emerald-subtle"
          : "bg-muted border border-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-card shadow-md transition-smooth ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── PIN Modal ─────────────────────────────────────────────────────────────────
function ChangePinModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (current.length < 4) e.current = "PIN must be at least 4 digits";
    if (next.length < 4) e.next = "PIN must be at least 4 digits";
    if (next !== confirm) e.confirm = "PINs do not match";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success("PIN changed successfully");
    setCurrent("");
    setNext("");
    setConfirm("");
    setErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change PIN"
      description="Enter your current PIN and choose a new one"
      data-ocid="change_pin.dialog"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="pin-current"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Current PIN
          </label>
          <input
            id="pin-current"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setErrors((p) => ({ ...p, current: undefined }));
            }}
            placeholder="••••"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
            data-ocid="change_pin.current_input"
          />
          {errors.current && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="change_pin.current_field_error"
            >
              {errors.current}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="pin-new"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            New PIN
          </label>
          <input
            id="pin-new"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={next}
            onChange={(e) => {
              setNext(e.target.value);
              setErrors((p) => ({ ...p, next: undefined }));
            }}
            placeholder="••••"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
            data-ocid="change_pin.new_input"
          />
          {errors.next && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="change_pin.new_field_error"
            >
              {errors.next}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="pin-confirm"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Confirm New PIN
          </label>
          <input
            id="pin-confirm"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            placeholder="••••"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
            data-ocid="change_pin.confirm_input"
          />
          {errors.confirm && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="change_pin.confirm_field_error"
            >
              {errors.confirm}
            </p>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
          onClick={handleSubmit}
          data-ocid="change_pin.submit_button"
        >
          <KeyRound className="h-4 w-4" />
          Update PIN
        </Button>
      </div>
    </Modal>
  );
}

// ─── Contact Support Modal ─────────────────────────────────────────────────────
function ContactSupportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Support ticket submitted. We'll respond within 24 hours.");
    setSubject("");
    setMessage("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Support"
      description="Our team is available Mon–Fri, 8am–6pm GMT"
      data-ocid="support.dialog"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="support-subject"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Subject
          </label>
          <input
            id="support-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Transaction dispute"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="support.subject_input"
          />
        </div>
        <div>
          <label
            htmlFor="support-message"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Message
          </label>
          <textarea
            id="support-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail…"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            data-ocid="support.message_textarea"
          />
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          onClick={handleSubmit}
          data-ocid="support.submit_button"
        >
          <MessageSquare className="h-4 w-4" />
          Send Message
        </Button>
      </div>
    </Modal>
  );
}

// ─── Close Account Modal ──────────────────────────────────────────────────────
function CloseAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Close Account"
      description="This action is permanent and cannot be undone"
      data-ocid="close_account.dialog"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 items-start">
          <TriangleAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            Closing your account will permanently delete all data, cancel all
            scheduled transfers, and any remaining balance will be returned
            within 5–7 business days.
          </p>
        </div>
        <div>
          <label
            htmlFor="close-account-confirm"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Type <span className="text-foreground font-mono">CONFIRM</span> to
            proceed
          </label>
          <input
            id="close-account-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CONFIRM"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive font-mono"
            data-ocid="close_account.confirm_input"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            data-ocid="close_account.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            disabled={confirmText !== "CONFIRM"}
            onClick={() => {
              toast.error("Account closure requires contacting support.");
              onClose();
            }}
            data-ocid="close_account.confirm_button"
          >
            Close Account
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  // TESTING MODE: use mock phone auth instead of Internet Identity
  const phone = localStorage.getItem("bcb_auth_phone") ?? "Not authenticated";

  function handleLogout() {
    localStorage.removeItem("bcb_auth_phone");
    navigate({ to: "/" });
  }

  const { data: accounts } = useAccounts();
  const createAccount = useCreateAccount();
  const [creatingType, setCreatingType] = useState<AccountType | null>(null);

  // Modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [closeAccountModalOpen, setCloseAccountModalOpen] = useState(false);

  // Security toggles
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(false);

  // Notification toggles
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifTransfer, setNotifTransfer] = useState(true);
  const [notifLogin, setNotifLogin] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // App preferences
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("GHS");
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const displayAccounts = accounts?.length ? accounts : sampleAccounts;
  // TESTING MODE: display masked phone as identity
  const truncatedPhone =
    phone.length > 7 ? `${phone.slice(0, 4)}****${phone.slice(-3)}` : phone;

  useEffect(() => {
    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  function copyPhone() {
    navigator.clipboard.writeText(phone);
    toast.success("Phone number copied");
  }

  async function handleCreateAccount(type: AccountType) {
    setCreatingType(type);
    try {
      await createAccount.mutateAsync(type);
      toast.success(`${type} account created!`);
    } catch {
      toast.error("Failed to create account.");
    } finally {
      setCreatingType(null);
    }
  }

  function handleBiometricToggle(v: boolean) {
    if (v) {
      toast.info("Biometric login coming soon");
    } else {
      setBiometric(false);
    }
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} mode`);
  }

  // ── Sidebar: profile card ──
  const ProfileSidebar = (
    <div className="space-y-4 lg:sticky lg:top-6">
      <Card variant="glow" data-ocid="settings.profile_card">
        <CardContent className="pt-5 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center glow-emerald-subtle">
              <span className="font-display font-bold text-2xl text-primary">
                KM
              </span>
            </div>
            <div>
              <p className="font-display font-semibold text-foreground text-lg leading-tight">
                Kwame Mensah
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                kwame.mensah@gmail.com
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
                <Badge variant="muted" size="sm">
                  Premium
                </Badge>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="space-y-2 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Member since
              </span>
              <span className="text-xs text-foreground font-medium">
                Jan 15, 2024
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground shrink-0">
                Phone
              </span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs font-mono text-foreground truncate">
                  {truncatedPhone}
                </span>
                <button
                  type="button"
                  onClick={copyPhone}
                  className="shrink-0 p-1 rounded-lg hover:bg-muted transition-smooth"
                  aria-label="Copy phone number"
                  data-ocid="settings.copy_principal_button"
                >
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick status */}
      <Card variant="default">
        <CardContent className="pt-4 pb-4 space-y-2">
          {[
            {
              icon: Shield,
              label: "Account Status",
              value: "Active",
              ok: true,
            },
            {
              icon: CheckCircle,
              label: "KYC Verified",
              value: "Yes",
              ok: true,
            },
            {
              icon: ShieldAlert,
              label: "2FA Enabled",
              value: twoFA ? "Yes" : "No",
              ok: twoFA,
            },
          ].map(({ icon: Icon, label, value, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${ok ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="flex-1 text-xs text-muted-foreground">
                {label}
              </span>
              <span
                className={`text-xs font-medium ${ok ? "text-primary" : "text-muted-foreground"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-slide-up">
        <PageHeader
          title="Settings"
          subtitle="Manage your profile and preferences"
        />

        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 space-y-6 lg:space-y-0">
          {/* ── Left: profile sidebar ── */}
          <div>{ProfileSidebar}</div>

          {/* ── Right: settings sections ── */}
          <div className="space-y-6">
            {/* MY ACCOUNTS */}
            <Section title="My Accounts">
              <Card variant="default" data-ocid="settings.accounts_card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Linked Accounts</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {displayAccounts.length} account
                      {displayAccounts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  {displayAccounts.map((acc, i) => (
                    <div
                      key={acc.accountId.toString()}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-smooth"
                      data-ocid={`settings.account_item.${i + 1}`}
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                        {acc.accountType === AccountType.Checking ? (
                          <CreditCard className="h-4 w-4 text-primary" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {acc.accountType} Account
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {maskAccountNumber(acc.accountNumber)} · Since{" "}
                          {formatDate(acc.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold font-display text-primary">
                          {formatCurrency(acc.balance)}
                        </p>
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Add account */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCreateAccount(AccountType.Checking)}
                      loading={
                        createAccount.isPending &&
                        creatingType === AccountType.Checking
                      }
                      data-ocid="settings.add_checking_button"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Checking
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCreateAccount(AccountType.Savings)}
                      loading={
                        createAccount.isPending &&
                        creatingType === AccountType.Savings
                      }
                      data-ocid="settings.add_savings_button"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Savings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* SECURITY */}
            <Section title="Security">
              <Card variant="default" data-ocid="settings.security_card">
                <CardContent className="pt-5 space-y-1">
                  {/* Change PIN */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth group text-left"
                    onClick={() => setPinModalOpen(true)}
                    data-ocid="settings.change_pin_button"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <KeyRound className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Change PIN
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Update your transaction PIN
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>

                  <div className="h-px bg-border/50 mx-3" />

                  {/* 2FA */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    data-ocid="settings.two_fa_row"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Require code on every login
                      </p>
                    </div>
                    <Toggle
                      enabled={twoFA}
                      onChange={setTwoFA}
                      data-ocid="settings.two_fa_toggle"
                    />
                  </div>

                  <div className="h-px bg-border/50 mx-3" />

                  {/* Biometric */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    data-ocid="settings.biometric_row"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          Biometric Login
                        </p>
                        <Badge variant="muted" size="sm">
                          Soon
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Face ID / Fingerprint unlock
                      </p>
                    </div>
                    <Toggle
                      enabled={biometric}
                      onChange={handleBiometricToggle}
                      data-ocid="settings.biometric_toggle"
                    />
                  </div>

                  <div className="h-px bg-border/50 mx-3" />

                  {/* Active Sessions */}
                  <div
                    className="p-3 space-y-2"
                    data-ocid="settings.sessions_section"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Laptop className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Active Sessions
                      </span>
                      <Badge variant="success" size="sm">
                        1 Active
                      </Badge>
                    </div>
                    <div
                      className="p-3 rounded-xl bg-muted/30 border border-border space-y-2"
                      data-ocid="settings.session_item.1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground flex items-center gap-1">
                            <Laptop className="h-3 w-3" /> Chrome on macOS
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Accra, Ghana
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active now · This device
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive text-xs h-7 px-2"
                          onClick={() =>
                            toast.info("Cannot revoke current session")
                          }
                          data-ocid="settings.revoke_session_button.1"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* NOTIFICATION PREFERENCES */}
            <Section title="Notification Preferences">
              <Card variant="default" data-ocid="settings.notifications_card">
                <CardContent className="pt-5 space-y-1">
                  {(
                    [
                      {
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                        icon: Bell,
                        value: notifEmail,
                        set: setNotifEmail,
                        ocid: "settings.notif_email_toggle",
                      },
                      {
                        label: "Push Notifications",
                        desc: "In-app alerts on your device",
                        icon: Bell,
                        value: notifPush,
                        set: setNotifPush,
                        ocid: "settings.notif_push_toggle",
                      },
                      {
                        label: "Transfer Alerts",
                        desc: "Every debit and credit",
                        icon: Zap,
                        value: notifTransfer,
                        set: setNotifTransfer,
                        ocid: "settings.notif_transfer_toggle",
                      },
                      {
                        label: "Login Alerts",
                        desc: "New sign-ins and access",
                        icon: Shield,
                        value: notifLogin,
                        set: setNotifLogin,
                        ocid: "settings.notif_login_toggle",
                      },
                      {
                        label: "Marketing Emails",
                        desc: "Offers and product updates",
                        icon: MessageSquare,
                        value: notifMarketing,
                        set: setNotifMarketing,
                        ocid: "settings.notif_marketing_toggle",
                      },
                    ] as const
                  ).map(
                    ({ label, desc, icon: Icon, value, set, ocid }, i, arr) => (
                      <div key={label}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-smooth">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {desc}
                            </p>
                          </div>
                          <Toggle
                            enabled={value}
                            onChange={set}
                            data-ocid={ocid}
                          />
                        </div>
                        {i < arr.length - 1 && (
                          <div className="h-px bg-border/50 mx-3" />
                        )}
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </Section>

            {/* APP PREFERENCES */}
            <Section title="App Preferences">
              <Card variant="default" data-ocid="settings.preferences_card">
                <CardContent className="pt-5 space-y-1">
                  {/* Language */}
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-smooth">
                    <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Language
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Interface language
                      </p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="text-xs font-medium text-foreground bg-muted/40 border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                      data-ocid="settings.language_select"
                    >
                      <option value="en">English</option>
                      <option value="tw">Twi</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div className="h-px bg-border/50 mx-3" />

                  {/* Currency */}
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-smooth">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Currency Display
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Default currency for amounts
                      </p>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-xs font-medium text-foreground bg-muted/40 border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                      data-ocid="settings.currency_select"
                    >
                      <option value="GHS">GH₵ Cedi</option>
                      <option value="USD">$ Dollar</option>
                      <option value="EUR">€ Euro</option>
                    </select>
                  </div>

                  <div className="h-px bg-border/50 mx-3" />

                  {/* Theme */}
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-smooth">
                    <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          Theme
                        </p>
                        <Badge variant="muted" size="sm">
                          {theme === "dark" ? "Dark" : "Light"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Choose how the app looks on this device
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleThemeToggle}
                      className="text-xs font-medium text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-1 hover:bg-muted transition-smooth"
                      data-ocid="settings.theme_toggle"
                    >
                      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* SUPPORT */}
            <Section title="Support">
              <Card variant="default" data-ocid="settings.support_card">
                <CardContent className="pt-5 space-y-1">
                  {(
                    [
                      {
                        icon: HelpCircle,
                        label: "Help Center",
                        desc: "FAQs and how-to guides",
                        action: () => toast.info("Opening Help Center…"),
                        badge: null,
                        external: true,
                        ocid: "settings.help_center_button",
                      },
                      {
                        icon: MessageSquare,
                        label: "Contact Support",
                        desc: "Send us a message",
                        action: () => setSupportModalOpen(true),
                        badge: null,
                        external: false,
                        ocid: "settings.contact_support_button",
                      },
                      {
                        icon: AlertTriangle,
                        label: "Report an Issue",
                        desc: "Flag a problem or bug",
                        action: () =>
                          toast.success("Issue report submitted. Thank you!"),
                        badge: null,
                        external: false,
                        ocid: "settings.report_issue_button",
                      },
                      {
                        icon: FileText,
                        label: "Privacy Policy",
                        desc: "How we handle your data",
                        action: () => toast.info("Opening Privacy Policy…"),
                        badge: null,
                        external: true,
                        ocid: "settings.privacy_policy_button",
                      },
                      {
                        icon: FileText,
                        label: "Terms of Service",
                        desc: "Usage terms and conditions",
                        action: () => toast.info("Opening Terms of Service…"),
                        badge: null,
                        external: true,
                        ocid: "settings.terms_button",
                      },
                    ] as const
                  ).map(
                    (
                      { icon: Icon, label, desc, action, external, ocid },
                      i,
                      arr,
                    ) => (
                      <div key={label}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth group text-left"
                          onClick={action}
                          data-ocid={ocid}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-smooth shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {desc}
                            </p>
                          </div>
                          {external ? (
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        {i < arr.length - 1 && (
                          <div className="h-px bg-border/50 mx-3" />
                        )}
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </Section>

            {/* DANGER ZONE */}
            <Section title="Danger Zone">
              <Card
                variant="default"
                className="border-destructive/20"
                data-ocid="settings.danger_card"
              >
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TriangleAlert className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      Irreversible Actions
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="danger"
                      size="md"
                      className="flex-1"
                      onClick={() => setCloseAccountModalOpen(true)}
                      data-ocid="settings.close_account_button"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Close Account
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1"
                      onClick={handleLogout}
                      data-ocid="settings.logout_button"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground pb-4 pt-2">
              © {new Date().getFullYear()} Bawjiase Community Bank PLC.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary transition-smooth"
              >
                Built with caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
      />
      <ContactSupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
      <CloseAccountModal
        isOpen={closeAccountModalOpen}
        onClose={() => setCloseAccountModalOpen(false)}
      />
    </>
  );
}
