import {
  AccountType,
  NotificationType,
  TransactionCategory,
  TransactionStatus,
} from "../backend";
import type { AccountView, NotificationView, Transaction } from "../types";

const NOW = BigInt(Date.now()) * 1_000_000n;
const DAY = 86_400_000_000_000n;
const HOUR = 3_600_000_000_000n;

export const sampleAccounts: AccountView[] = [
  {
    accountId: 1n,
    ownerId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    accountType: AccountType.Checking,
    balance: 4_587_050n, // GH₵ 45,870.50
    accountNumber: "BCB-001-2024-0042",
    createdAt: NOW - DAY * 365n,
  },
  {
    accountId: 2n,
    ownerId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    accountType: AccountType.Savings,
    balance: 12_345_000n, // GH₵ 123,450.00
    accountNumber: "BCB-002-2024-0107",
    createdAt: NOW - DAY * 180n,
  },
];

export const sampleTransactions: Transaction[] = [
  {
    txId: 1n,
    fromAccount: 1n,
    toAccount: undefined,
    amount: 120_000n,
    description: "Shoprite Supermarket",
    category: TransactionCategory.Payment,
    timestamp: NOW - HOUR * 2n,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-001",
  },
  {
    txId: 2n,
    fromAccount: undefined,
    toAccount: 1n,
    amount: 550_000n,
    description: "Transfer from Aisha Bello",
    category: TransactionCategory.Transfer,
    timestamp: NOW - DAY,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-002",
  },
  {
    txId: 3n,
    fromAccount: 1n,
    toAccount: undefined,
    amount: 35_075n,
    description: "ECG Ghana – Electricity",
    category: TransactionCategory.Payment,
    timestamp: NOW - DAY,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-003",
  },
  {
    txId: 4n,
    fromAccount: undefined,
    toAccount: 1n,
    amount: 2_000_000n,
    description: "Monthly Salary – Acme Corp",
    category: TransactionCategory.Deposit,
    timestamp: NOW - DAY * 3n,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-004",
  },
  {
    txId: 5n,
    fromAccount: 1n,
    toAccount: undefined,
    amount: 80_000n,
    description: "MTN Mobile Money Top-Up",
    category: TransactionCategory.Withdrawal,
    timestamp: NOW - DAY * 4n,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-005",
  },
  {
    txId: 6n,
    fromAccount: 1n,
    toAccount: 2n,
    amount: 500_000n,
    description: "Transfer to Savings",
    category: TransactionCategory.Transfer,
    timestamp: NOW - DAY * 5n,
    status: TransactionStatus.Completed,
    referenceNumber: "REF-2024-006",
  },
];

export const sampleNotifications: NotificationView[] = [
  {
    notifId: 1n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.TransferConfirmation,
    title: "Transfer Received",
    message: "GH₵ 5,500.00 received from Aisha Bello",
    isRead: false,
    timestamp: NOW - HOUR * 2n,
  },
  {
    notifId: 2n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.LoginAlert,
    title: "New Login Detected",
    message: "A new login was detected from Accra, Ghana",
    isRead: false,
    timestamp: NOW - HOUR * 5n,
  },
  {
    notifId: 3n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.AccountActivity,
    title: "Large Debit Alert",
    message: "GH₵ 1,200.00 debited from your checking account",
    isRead: true,
    timestamp: NOW - DAY,
  },
  {
    notifId: 4n,
    userId: { _isPrincipal: true, toText: () => "demo-principal" } as never,
    notifType: NotificationType.SecurityAlert,
    title: "Security Update",
    message: "Your account security settings were updated successfully",
    isRead: true,
    timestamp: NOW - DAY * 2n,
  },
];
