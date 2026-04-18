import type {
  AccountType,
  AccountView,
  NotificationType,
  NotificationView,
  Transaction,
  TransactionCategory,
  TransactionPage,
  TransactionStatus,
  TransferRequest,
  TransferResult,
} from "../backend.d";

export type {
  AccountView,
  Transaction,
  NotificationView,
  AccountType,
  TransactionCategory,
  TransactionStatus,
  NotificationType,
  TransferRequest,
  TransferResult,
  TransactionPage,
};

export interface AppState {
  accounts: AccountView[];
  transactions: Transaction[];
  notifications: NotificationView[];
  isLoading: boolean;
  activeAccountId: bigint | null;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}
