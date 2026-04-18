import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransferRequest {
    description: string;
    toAccountId: AccountId;
    fromAccountId: AccountId;
    amount: bigint;
}
export interface TransactionPage {
    total: bigint;
    hasMore: boolean;
    transactions: Array<Transaction>;
}
export interface AccountView {
    balance: bigint;
    accountId: AccountId;
    ownerId: UserId;
    createdAt: Timestamp;
    accountType: AccountType;
    accountNumber: string;
}
export interface NotificationView {
    title: string;
    notifType: NotificationType;
    userId: UserId;
    notifId: NotificationId;
    isRead: boolean;
    message: string;
    timestamp: Timestamp;
}
export type UserId = Principal;
export type TransactionId = bigint;
export interface Transaction {
    status: TransactionStatus;
    referenceNumber: string;
    fromAccount?: AccountId;
    txId: TransactionId;
    description: string;
    timestamp: Timestamp;
    category: TransactionCategory;
    toAccount?: AccountId;
    amount: bigint;
}
export interface TransferResult {
    transaction: Transaction;
    newFromBalance: bigint;
    newToBalance: bigint;
}
export type NotificationId = bigint;
export type AccountId = bigint;
export enum AccountType {
    Savings = "Savings",
    Checking = "Checking"
}
export enum NotificationType {
    TransferConfirmation = "TransferConfirmation",
    LoginAlert = "LoginAlert",
    AccountActivity = "AccountActivity",
    SecurityAlert = "SecurityAlert"
}
export enum TransactionCategory {
    Deposit = "Deposit",
    Withdrawal = "Withdrawal",
    Transfer = "Transfer",
    Payment = "Payment"
}
export enum TransactionStatus {
    Failed = "Failed",
    Completed = "Completed",
    Pending = "Pending"
}
export interface backendInterface {
    createAccount(accountType: AccountType): Promise<AccountView>;
    dismissNotification(notifId: NotificationId): Promise<boolean>;
    getAccount(accountId: AccountId): Promise<AccountView | null>;
    getMyAccounts(): Promise<Array<AccountView>>;
    getNotifications(): Promise<Array<NotificationView>>;
    getTransaction(txId: TransactionId): Promise<Transaction | null>;
    getTransactions(accountId: AccountId, offset: bigint, limit: bigint): Promise<TransactionPage>;
    getUnreadCount(): Promise<bigint>;
    initSampleData(): Promise<boolean>;
    isSampleDataSeeded(): Promise<boolean>;
    markNotificationRead(notifId: NotificationId): Promise<boolean>;
    transfer(req: TransferRequest): Promise<TransferResult>;
}
