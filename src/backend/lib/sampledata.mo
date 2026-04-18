import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccountTypes "../types/accounts";
import TxTypes "../types/transactions";
import NotifTypes "../types/notifications";
import CommonTypes "../types/common";

// Generates demo seed data for the banking application
module {
  public type UserId = CommonTypes.UserId;

  /// Seed checking + savings accounts for a demo user; appends to accounts list
  public func seedAccounts(
    accounts : List.List<AccountTypes.Account>,
    ownerId : UserId,
    nextId : Nat,
    now : Int,
  ) : Nat {
    // Returns the next available accountId after seeding
    Runtime.trap("not implemented");
  };

  /// Seed 10-20 sample transactions for demo accounts; appends to transactions list
  public func seedTransactions(
    transactions : List.List<TxTypes.Transaction>,
    checkingId : Nat,
    savingsId : Nat,
    nextId : Nat,
    now : Int,
  ) : Nat {
    // Returns the next available txId after seeding
    Runtime.trap("not implemented");
  };

  /// Seed 5-10 sample notifications for a demo user; appends to notifications list
  public func seedNotifications(
    notifications : List.List<NotifTypes.Notification>,
    userId : UserId,
    nextId : Nat,
    now : Int,
  ) : Nat {
    // Returns the next available notifId after seeding
    Runtime.trap("not implemented");
  };
};
