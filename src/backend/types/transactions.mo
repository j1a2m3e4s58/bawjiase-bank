import CommonTypes "common";

// Transaction domain types
module {
  public type AccountId = CommonTypes.AccountId;
  public type TransactionId = CommonTypes.TransactionId;
  public type Timestamp = CommonTypes.Timestamp;

  public type TransactionCategory = {
    #Transfer;
    #Payment;
    #Deposit;
    #Withdrawal;
  };

  public type TransactionStatus = {
    #Pending;
    #Completed;
    #Failed;
  };

  public type Transaction = {
    txId : TransactionId;
    fromAccount : ?AccountId; // null for external deposits
    toAccount : ?AccountId;   // null for external withdrawals
    amount : Nat;
    description : Text;
    category : TransactionCategory;
    timestamp : Timestamp;
    status : TransactionStatus;
    referenceNumber : Text;
  };

  public type TransferRequest = {
    fromAccountId : AccountId;
    toAccountId : AccountId;
    amount : Nat;
    description : Text;
  };

  public type TransferResult = {
    transaction : Transaction;
    newFromBalance : Nat;
    newToBalance : Nat;
  };

  public type TransactionPage = {
    transactions : [Transaction];
    total : Nat;
    hasMore : Bool;
  };
};
