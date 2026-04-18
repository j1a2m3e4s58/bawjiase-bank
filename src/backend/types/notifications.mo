import CommonTypes "common";

// Notification domain types
module {
  public type UserId = CommonTypes.UserId;
  public type NotificationId = CommonTypes.NotificationId;
  public type Timestamp = CommonTypes.Timestamp;

  public type NotificationType = {
    #LoginAlert;
    #TransferConfirmation;
    #AccountActivity;
    #SecurityAlert;
  };

  public type Notification = {
    notifId : NotificationId;
    userId : UserId;
    notifType : NotificationType;
    title : Text;
    message : Text;
    var isRead : Bool;
    timestamp : Timestamp;
  };

  // Shared (immutable) notification for API boundary
  public type NotificationView = {
    notifId : NotificationId;
    userId : UserId;
    notifType : NotificationType;
    title : Text;
    message : Text;
    isRead : Bool;
    timestamp : Timestamp;
  };
};
