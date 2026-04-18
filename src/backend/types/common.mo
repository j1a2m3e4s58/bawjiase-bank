// Cross-cutting types shared across all banking domains
module {
  public type UserId = Principal;
  public type AccountId = Nat;
  public type TransactionId = Nat;
  public type NotificationId = Nat;
  public type Timestamp = Int; // nanoseconds from Time.now()
};
