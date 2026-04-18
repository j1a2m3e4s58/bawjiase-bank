import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { useIsMobile } from "../../hooks/use-mobile";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile(1024);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main content area */}
      <main
        className={`flex-1 overflow-y-auto ${isMobile ? "pb-[72px]" : ""}`}
        id="main-content"
      >
        <div className="min-h-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-fade-in">
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Demo environment only. This app is for testing and presentation,
            not live banking. Do not enter real account or payment details.
          </div>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}

      {/* Global toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border border-border text-foreground shadow-elevated",
            title: "font-display font-semibold",
            description: "text-muted-foreground text-sm",
            success: "border-primary/40 [&>[data-icon]]:text-primary",
            error: "border-destructive/40",
          },
        }}
      />
    </div>
  );
}
