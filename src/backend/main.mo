import List "mo:core/List";
import AccountTypes "types/accounts";
import TxTypes "types/transactions";
import NotifTypes "types/notifications";
import AccountsApi "mixins/accounts-api";
import TransactionsApi "mixins/transactions-api";
import NotificationsApi "mixins/notifications-api";
import SampleDataApi "mixins/sampledata-api";

// Composition root — owns all shared collections, delegates to mixins
actor {
  // ── Shared state ──────────────────────────────────────────────────────────
  let accounts      = List.empty<AccountTypes.Account>();
  let transactions  = List.empty<TxTypes.Transaction>();
  let notifications = List.empty<NotifTypes.Notification>();

  // ── Mixin composition ─────────────────────────────────────────────────────
  include AccountsApi(accounts);
  include TransactionsApi(accounts, transactions);
  include NotificationsApi(notifications);
  include SampleDataApi(accounts, transactions, notifications);
};
