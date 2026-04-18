import { create } from "zustand";
import type { AccountView, NotificationView, Transaction } from "../types";

interface AppStore {
  accounts: AccountView[];
  transactions: Transaction[];
  notifications: NotificationView[];
  isLoading: boolean;
  activeAccountId: bigint | null;

  setAccounts: (accounts: AccountView[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setNotifications: (notifications: NotificationView[]) => void;
  setLoading: (loading: boolean) => void;
  setActiveAccountId: (id: bigint | null) => void;
  markNotificationRead: (id: bigint) => void;
  dismissNotification: (id: bigint) => void;
  unreadCount: () => number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  accounts: [],
  transactions: [],
  notifications: [],
  isLoading: false,
  activeAccountId: null,

  setAccounts: (accounts) => set({ accounts }),
  setTransactions: (transactions) => set({ transactions }),
  setNotifications: (notifications) => set({ notifications }),
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveAccountId: (id) => set({ activeAccountId: id }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notifId === id ? { ...n, isRead: true } : n,
      ),
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.notifId !== id),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
