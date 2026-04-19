import {
  AccountType,
  NotificationType,
  TransactionCategory,
  TransactionStatus,
  type TransferRequest,
  type TransferResult,
} from "../backend";
import type { AccountView, NotificationView, Transaction } from "../types";
import {
  sampleAccounts,
  sampleNotifications,
  sampleTransactions,
} from "./sampleData";

const MOCK_BANK_KEY = "bcb_mock_bank_v1";
const BIGINT_KEYS = new Set([
  "accountId",
  "amount",
  "balance",
  "createdAt",
  "fromAccount",
  "notifId",
  "timestamp",
  "toAccount",
  "total",
  "transactionId",
  "txId",
]);

export interface MockBankState {
  accounts: AccountView[];
  notifications: NotificationView[];
  transactions: Transaction[];
}

function reviveBigInts<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(reviveBigInts) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        BIGINT_KEYS.has(key) && typeof entry === "string"
          ? BigInt(entry as string)
          : reviveBigInts(entry),
      ]),
    ) as T;
  }

  return value;
}

function serialize(state: MockBankState) {
  return JSON.stringify(state, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

function seedState(): MockBankState {
  return {
    accounts: sampleAccounts,
    notifications: sampleNotifications,
    transactions: sampleTransactions,
  };
}

export function getMockBankState(): MockBankState {
  if (typeof window === "undefined") {
    return seedState();
  }

  const stored = localStorage.getItem(MOCK_BANK_KEY);
  if (!stored) {
    const seeded = seedState();
    localStorage.setItem(MOCK_BANK_KEY, serialize(seeded));
    return seeded;
  }

  try {
    return reviveBigInts(JSON.parse(stored)) as MockBankState;
  } catch {
    const seeded = seedState();
    localStorage.setItem(MOCK_BANK_KEY, serialize(seeded));
    return seeded;
  }
}

export function saveMockBankState(state: MockBankState) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MOCK_BANK_KEY, serialize(state));
}

function nextBigInt(items: unknown[], key: string) {
  const max = items.reduce((largest, item) => {
    const record = item as Record<string, unknown>;
    const value = typeof record[key] === "bigint" ? record[key] : 0n;
    return value > largest ? value : largest;
  }, 0n);
  return max + 1n;
}

export function createMockTransfer(req: TransferRequest): TransferResult {
  const state = getMockBankState();
  const fromAccount = state.accounts.find(
    (account) => account.accountId === req.fromAccountId,
  );

  if (!fromAccount) {
    throw new Error("Source account not found.");
  }

  if (req.amount <= 0n) {
    throw new Error("Transfer amount must be greater than zero.");
  }

  if (fromAccount.balance < req.amount) {
    throw new Error("Insufficient balance for this transfer.");
  }

  const maybeInternalAccount = state.accounts.find(
    (account) => account.accountId === req.toAccountId,
  );
  const timestamp = BigInt(Date.now()) * 1_000_000n;
  const txId = nextBigInt(state.transactions, "txId");
  const notificationId = nextBigInt(state.notifications, "notifId");
  const referenceNumber = `REF-${new Date().getFullYear()}-${txId
    .toString()
    .padStart(4, "0")}`;

  const transaction: Transaction = {
    txId,
    fromAccount: req.fromAccountId,
    toAccount: req.toAccountId,
    amount: req.amount,
    description: req.description || "Demo transfer",
    category: TransactionCategory.Transfer,
    timestamp,
    status: TransactionStatus.Completed,
    referenceNumber,
  };

  const accounts = state.accounts.map((account) => {
    if (account.accountId === req.fromAccountId) {
      return { ...account, balance: account.balance - req.amount };
    }

    if (account.accountId === req.toAccountId) {
      return { ...account, balance: account.balance + req.amount };
    }

    return account;
  });

  const notifications: NotificationView[] = [
    {
      notifId: notificationId,
      userId: fromAccount.ownerId,
      notifType: NotificationType.TransferConfirmation,
      title: "Demo Transfer Complete",
      message: `${referenceNumber} sent successfully in demo mode.`,
      isRead: false,
      timestamp,
    },
    ...state.notifications,
  ];

  saveMockBankState({
    accounts,
    notifications,
    transactions: [transaction, ...state.transactions],
  });

  return {
    transaction,
    newFromBalance: fromAccount.balance - req.amount,
    newToBalance: maybeInternalAccount
      ? maybeInternalAccount.balance + req.amount
      : 0n,
  };
}

export function createMockAccount(accountType: AccountType): AccountView {
  const state = getMockBankState();
  const accountId = nextBigInt(state.accounts, "accountId");
  const account: AccountView = {
    accountId,
    ownerId:
      state.accounts[0]?.ownerId ??
      ({ _isPrincipal: true, toText: () => "demo-principal" } as never),
    accountType,
    balance: 0n,
    accountNumber: `BCB-${accountId.toString().padStart(3, "0")}-DEMO`,
    createdAt: BigInt(Date.now()) * 1_000_000n,
  };

  saveMockBankState({
    ...state,
    accounts: [...state.accounts, account],
  });

  return account;
}
