import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccountTypes "../types/accounts";
import TxTypes "../types/transactions";
import NotifTypes "../types/notifications";

// Public API surface for seeding demo data
mixin (
  accounts : List.List<AccountTypes.Account>,
  transactions : List.List<TxTypes.Transaction>,
  notifications : List.List<NotifTypes.Notification>,
) {
  var sampleDataSeeded : Bool = false;

  /// Initialize sample data for the calling principal (idempotent — only seeds once per principal)
  public shared ({ caller }) func initSampleData() : async Bool {
    Runtime.trap("not implemented");
  };

  /// Check whether sample data has been seeded for the caller
  public shared query ({ caller }) func isSampleDataSeeded() : async Bool {
    Runtime.trap("not implemented");
  };
};
