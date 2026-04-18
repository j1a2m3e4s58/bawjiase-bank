import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccountTypes "../types/accounts";
import CommonTypes "../types/common";

// Public API surface for account management
mixin (
  accounts : List.List<AccountTypes.Account>,
) {
  var nextAccountId : Nat = 1;

  public type AccountView = AccountTypes.AccountView;
  public type AccountType = AccountTypes.AccountType;

  /// Get all accounts belonging to the caller
  public shared query ({ caller }) func getMyAccounts() : async [AccountView] {
    Runtime.trap("not implemented");
  };

  /// Get a specific account by ID (caller must own it)
  public shared query ({ caller }) func getAccount(accountId : CommonTypes.AccountId) : async ?AccountView {
    Runtime.trap("not implemented");
  };

  /// Create a new account for the caller
  public shared ({ caller }) func createAccount(accountType : AccountType) : async AccountView {
    Runtime.trap("not implemented");
  };
};
