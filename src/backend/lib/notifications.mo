import List "mo:core/List";
import Runtime "mo:core/Runtime";
import NotifTypes "../types/notifications";
import CommonTypes "../types/common";

// Domain logic for notification management
module {
  public type Notification = NotifTypes.Notification;
  public type NotificationView = NotifTypes.NotificationView;
  public type NotificationType = NotifTypes.NotificationType;
  public type UserId = CommonTypes.UserId;
  public type NotificationId = CommonTypes.NotificationId;

  /// Convert mutable Notification to shared NotificationView
  public func toView(self : Notification) : NotificationView {
    Runtime.trap("not implemented");
  };

  /// Create a new notification record
  public func new(
    notifId : NotificationId,
    userId : UserId,
    notifType : NotificationType,
    title : Text,
    message : Text,
    timestamp : Int,
  ) : Notification {
    Runtime.trap("not implemented");
  };

  /// Get all notifications for a user, newest first
  public func getByUser(notifications : List.List<Notification>, userId : UserId) : [NotificationView] {
    Runtime.trap("not implemented");
  };

  /// Count unread notifications for a user
  public func countUnread(notifications : List.List<Notification>, userId : UserId) : Nat {
    Runtime.trap("not implemented");
  };

  /// Mark a specific notification as read; returns false if not found or not owned
  public func markRead(notifications : List.List<Notification>, notifId : NotificationId, userId : UserId) : Bool {
    Runtime.trap("not implemented");
  };

  /// Dismiss (remove) a notification; returns false if not found or not owned
  public func dismiss(notifications : List.List<Notification>, notifId : NotificationId, userId : UserId) : Bool {
    Runtime.trap("not implemented");
  };
};
