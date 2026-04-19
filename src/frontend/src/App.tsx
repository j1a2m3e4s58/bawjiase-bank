import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  Outlet,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { LoadingPage } from "./components/BankLoading";
import SplashScreen from "./components/SplashScreen";
import { Layout } from "./components/layout/Layout";
import { initializeTheme } from "./lib/theme";
import LoginPage from "./pages/LoginPage";

// Lazy-loaded pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const TransfersPage = lazy(() => import("./pages/TransfersPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// TESTING MODE: accepts any phone number stored in localStorage.
function requireAuth() {
  const hasAuth =
    typeof window !== "undefined" && !!localStorage.getItem("bcb_auth_phone");
  if (!hasAuth) {
    throw redirect({ to: "/" });
  }
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: requireAuth,
  component: ProtectedLayout,
});

function ProtectedLayout() {
  // TESTING MODE: no real identity check needed - mock phone auth.
  const phone = localStorage.getItem("bcb_auth_phone");
  if (!phone) {
    return <LoadingPage label="Connecting..." />;
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingPage />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const transfersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/transfers",
  component: TransfersPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    transactionsRoute,
    transfersRoute,
    notificationsRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <RouterProvider router={router} />
    </>
  );
}
