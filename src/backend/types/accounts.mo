import CommonTypes "common";

// Account domain types
module {
  public type UserId = CommonTypes.UserId;
  public type AccountId = CommonTypes.AccountId;
  public type Timestamp = CommonTypes.Timestamp;

  public type AccountType = {
    #Checking;
    #Savings;
  };

  // Internal mutable account record
  public type Account = {
    accountId : AccountId;
    ownerId : UserId;
    accountType : AccountType;
    var balance : Nat; // stored in minor units (e.g. pesewas)
    accountNumber : Text;
    createdAt : Timestamp;
  };

  // Shared (immutable) account for API boundary
  public type AccountView = {
    accountId : AccountId;
    ownerId : UserId;
    accountType : AccountType;
    balance : Nat;
    accountNumber : Text;
    createdAt : Timestamp;
  };
};
