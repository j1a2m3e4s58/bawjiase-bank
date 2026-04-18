import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/BankButton";
import { Modal } from "../components/BankModal";

// ─── Register Modal ────────────────────────────────────────────────────────────
function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    if (pin.length < 4) e.pin = "PIN must be at least 4 digits";
    if (pin !== confirmPin) e.confirmPin = "PINs do not match";
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
    toast.success("Account created! You can now sign in.");
    setFullName("");
    setPhone("");
    setPin("");
    setConfirmPin("");
    setErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Account"
      description="Open your Bawjiase Community Bank account today"
      data-ocid="register.dialog"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="reg-name"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((p) => ({ ...p, fullName: "" }));
            }}
            placeholder="e.g. Kwame Mensah"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="register.name_input"
          />
          {errors.fullName && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="register.name_field_error"
            >
              {errors.fullName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="reg-phone"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors((p) => ({ ...p, phone: "" }));
            }}
            placeholder="+233 XX XXX XXXX"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="register.phone_input"
          />
          {errors.phone && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="register.phone_field_error"
            >
              {errors.phone}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="reg-pin"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            PIN (4–6 digits)
          </label>
          <input
            id="reg-pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setErrors((p) => ({ ...p, pin: "" }));
            }}
            placeholder="••••"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
            data-ocid="register.pin_input"
          />
          {errors.pin && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="register.pin_field_error"
            >
              {errors.pin}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="reg-confirm-pin"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Confirm PIN
          </label>
          <input
            id="reg-confirm-pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => {
              setConfirmPin(e.target.value);
              setErrors((p) => ({ ...p, confirmPin: "" }));
            }}
            placeholder="••••"
            className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
            data-ocid="register.confirm_pin_input"
          />
          {errors.confirmPin && (
            <p
              className="mt-1 text-xs text-destructive"
              data-ocid="register.confirm_pin_field_error"
            >
              {errors.confirmPin}
            </p>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
          onClick={handleSubmit}
          data-ocid="register.submit_button"
        >
          Create Account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By registering you agree to our{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => toast.info("Terms of Service coming soon")}
          >
            Terms of Service
          </button>
        </p>
      </div>
    </Modal>
  );
}

// ─── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  function handleClose() {
    setPhone("");
    setSent(false);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Forgot Password"
      description="We'll send a reset link to your registered phone number"
      data-ocid="forgot_password.dialog"
    >
      {sent ? (
        <div className="text-center space-y-4 py-2">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/15 border border-primary/30 mx-auto">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Reset link sent!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check your SMS for the password reset link. It expires in 10
              minutes.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleClose}
            data-ocid="forgot_password.done_button"
          >
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="forgot-phone"
              className="block text-xs font-medium text-muted-foreground mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="forgot-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 XX XXX XXXX"
              className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="forgot_password.phone_input"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            onClick={handleSend}
            data-ocid="forgot_password.send_button"
          >
            Send Reset Link
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full text-muted-foreground"
            onClick={handleClose}
            data-ocid="forgot_password.cancel_button"
          >
            Cancel
          </Button>
        </div>
      )}
    </Modal>
  );
}

// ─── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // TESTING MODE: accepts any phone number
  async function handleLogin() {
    if (!phone.trim()) {
      setPhoneError("Please enter your phone number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    // Store mock auth
    localStorage.setItem("bcb_auth_phone", phone.trim());
    setLoading(false);
    navigate({ to: "/dashboard" });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 h-72 w-72 rounded-full bg-accent/5 blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 h-48 w-48 rounded-full bg-primary/5 blur-[60px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm animate-scale-in">
          {/* Main card */}
          <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-elevated space-y-7">
            {/* Logo & Bank Name */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex items-center justify-center">
                {/* Glow ring behind logo */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 120,
                    height: 120,
                    background:
                      "radial-gradient(circle, oklch(0.72 0.21 150 / 0.2) 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />
                <img
                  src="/assets/images/bcb-logo.png"
                  alt="Bawjiase Community Bank PLC"
                  className="relative z-10 drop-shadow-[0_0_18px_oklch(0.72_0.21_150_/_0.45)]"
                  style={{ width: 96, height: 96, objectFit: "contain" }}
                />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground leading-tight">
                  Bawjiase Community Bank
                </h1>
                <p className="text-sm font-semibold tracking-widest uppercase mt-0.5 text-primary">
                  PLC
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your trusted banking partner
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Sign In heading */}
            <div className="text-center">
              <h2 className="font-display font-semibold text-base text-foreground">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your phone number to continue
              </p>
            </div>

            {/* Phone input */}
            <div className="space-y-2">
              <label
                htmlFor="login-phone"
                className="block text-xs font-medium text-muted-foreground"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="login-phone"
                  type={showPhone ? "text" : "tel"}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl bg-muted/40 border border-border pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-smooth"
                  data-ocid="login.phone_input"
                />
                <button
                  type="button"
                  onClick={() => setShowPhone((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth p-1"
                  aria-label={showPhone ? "Hide number" : "Show number"}
                  data-ocid="login.toggle_phone_visibility"
                >
                  {showPhone ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {phoneError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="login.phone_field_error"
                >
                  {phoneError}
                </p>
              )}
            </div>

            {/* Sign In button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full glow-emerald-subtle"
              onClick={handleLogin}
              loading={loading}
              data-ocid="login.submit_button"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            {/* Forgot password link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-primary hover:text-primary/80 transition-smooth underline-offset-2 hover:underline"
                data-ocid="login.forgot_password_link"
              >
                Forgot Password?
              </button>
            </div>

            {/* Divider + Register */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">New to BCB?</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setRegisterOpen(true)}
              data-ocid="login.register_button"
            >
              Create Account
            </Button>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-muted-foreground">
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

      {/* Modals */}
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
