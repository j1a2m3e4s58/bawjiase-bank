import List "mo:core/List";
import Runtime "mo:core/Runtime";
import NotifTypes "../types/notifications";
import CommonTypes "../types/common";

// Public API surface for notification management
mixin (
  notifications : List.List<NotifTypes.Notification>,
) {
  var nextNotifId : Nat = 1;

  public type NotificationView = NotifTypes.NotificationView;

  /// Get all notifications for the caller
  public shared query ({ caller }) func getNotifications() : async [NotificationView] {
    Runtime.trap("not implemented");
  };

  /// Get the count of unread notifications for the caller
  public shared query ({ caller }) func getUnreadCount() : async Nat {
    Runtime.trap("not implemented");
  };

  /// Mark a notification as read (caller must own it)
  public shared ({ caller }) func markNotificationRead(notifId : CommonTypes.NotificationId) : async Bool {
    Runtime.trap("not implemented");
  };

  /// Dismiss (delete) a notification (caller must own it)
  public shared ({ caller }) func dismissNotification(notifId : CommonTypes.NotificationId) : async Bool {
    Runtime.trap("not implemented");
  };
};
