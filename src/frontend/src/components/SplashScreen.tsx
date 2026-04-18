import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // After logo + name appear (~1.4s), hold briefly
    const holdTimer = setTimeout(() => setPhase("hold"), 1400);
    // Start exit fade at 2.6s
    const exitTimer = setTimeout(() => setPhase("exit"), 2600);
    // Notify parent to unmount at 3.2s
    const doneTimer = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.18 0.06 145 / 0.9) 0%, oklch(0.08 0.01 145) 70%)",
        animation:
          phase === "exit"
            ? "splash-fade-out 0.6s ease-in-out forwards"
            : undefined,
      }}
    >
      {/* Keyframe styles */}
      <style>{`
        @keyframes splash-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
        @keyframes logo-enter {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.05); }
          80%  { transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes name-enter {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.12); }
        }
        @keyframes ring-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.21 150 / 0.12) 0%, transparent 70%)",
            animation: "glow-pulse 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[280px] w-[280px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.21 150 / 0.18) 0%, transparent 70%)",
            animation: "glow-pulse 2.2s ease-in-out infinite 0.4s",
          }}
        />
      </div>

      {/* Spinning ring behind logo */}
      <div
        className="absolute"
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "1.5px solid oklch(0.72 0.21 150 / 0.3)",
          borderTopColor: "oklch(0.72 0.21 150 / 0.9)",
          animation: "ring-spin 2.5s linear infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 196,
          height: 196,
          borderRadius: "50%",
          border: "1px solid oklch(0.72 0.21 150 / 0.15)",
          borderBottomColor: "oklch(0.72 0.21 150 / 0.6)",
          animation: "ring-spin 3.5s linear infinite reverse",
        }}
      />

      {/* Content: logo + bank name */}
      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        {/* Logo */}
        <div
          style={{
            animation:
              "logo-enter 1.0s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            opacity: 0,
          }}
        >
          {/* Neon glow ring around logo */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full"
              style={{
                width: 160,
                height: 160,
                background:
                  "radial-gradient(circle, oklch(0.72 0.21 150 / 0.25) 0%, transparent 70%)",
                animation: "glow-pulse 1.8s ease-in-out infinite",
              }}
              aria-hidden="true"
            />
            <img
              src="/assets/images/bcb-logo.png"
              alt="Bawjiase Community Bank PLC"
              className="relative z-10 drop-shadow-[0_0_24px_oklch(0.72_0.21_150_/_0.6)]"
              style={{ width: 130, height: 130, objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Bank name */}
        <div
          style={{
            animation: "name-enter 0.7s ease-out 0.85s forwards",
            opacity: 0,
          }}
        >
          <h1
            className="font-display font-bold text-2xl tracking-tight"
            style={{ color: "oklch(0.96 0.03 150)" }}
          >
            Bawjiase Community Bank
          </h1>
          <p
            className="text-sm tracking-[0.22em] uppercase font-medium mt-1"
            style={{ color: "oklch(0.72 0.21 150)" }}
          >
            PLC
          </p>
          {/* Tagline */}
          <p
            className="mt-3 text-xs tracking-widest uppercase"
            style={{
              color: "oklch(0.72 0.21 150 / 0.65)",
              animation: "name-enter 0.6s ease-out 1.1s forwards",
              opacity: 0,
            }}
          >
            Your trusted banking partner
          </p>
        </div>
      </div>

      {/* Bottom dots */}
      <div
        className="absolute bottom-16 flex gap-2"
        style={{
          animation: "name-enter 0.5s ease-out 1.3s forwards",
          opacity: 0,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full"
            style={{
              background:
                i === 1
                  ? "oklch(0.72 0.21 150)"
                  : "oklch(0.72 0.21 150 / 0.35)",
              animation: `glow-pulse ${1.2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
