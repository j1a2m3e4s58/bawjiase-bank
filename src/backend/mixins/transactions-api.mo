import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccountTypes "../types/accounts";
import TxTypes "../types/transactions";
import CommonTypes "../types/common";

// Public API surface for transactions and fund transfers
mixin (
  accounts : List.List<AccountTypes.Account>,
  transactions : List.List<TxTypes.Transaction>,
) {
  var nextTxId : Nat = 1;

  public type Transaction = TxTypes.Transaction;
  public type TransferRequest = TxTypes.TransferRequest;
  public type TransferResult = TxTypes.TransferResult;
  public type TransactionPage = TxTypes.TransactionPage;

  /// Get paginated transaction history for an account owned by the caller
  public shared query ({ caller }) func getTransactions(
    accountId : CommonTypes.AccountId,
    offset : Nat,
    limit : Nat,
  ) : async TransactionPage {
    Runtime.trap("not implemented");
  };

  /// Get details for a single transaction
  public shared query ({ caller }) func getTransaction(txId : CommonTypes.TransactionId) : async ?Transaction {
    Runtime.trap("not implemented");
  };

  /// Transfer funds between two accounts; caller must own the source account
  public shared ({ caller }) func transfer(req : TransferRequest) : async TransferResult {
    Runtime.trap("not implemented");
  };
};
