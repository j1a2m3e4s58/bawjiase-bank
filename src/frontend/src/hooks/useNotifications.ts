import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import { getMockBankState, saveMockBankState } from "../lib/mockBank";
import { useAppStore } from "../store/useAppStore";
import type { NotificationView } from "../types";

export function useNotifications() {
  const { actor, isFetching } = useActor(createActor);
  const setNotifications = useAppStore((s) => s.setNotifications);

  const query = useQuery<NotificationView[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return getMockBankState().notifications;
      return actor.getNotifications();
    },
    enabled: !isFetching,
    initialData: () => getMockBankState().notifications,
    refetchInterval: 30_000, // poll every 30 seconds
  });

  useEffect(() => {
    if (query.data) setNotifications(query.data);
  }, [query.data, setNotifications]);

  return query;
}

export function useUnreadCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor)
        return BigInt(getMockBankState().notifications.filter((n) => !n.isRead).length);
      return actor.getUnreadCount();
    },
    enabled: !isFetching,
    initialData: () =>
      BigInt(getMockBankState().notifications.filter((n) => !n.isRead).length),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const markRead = useAppStore((s) => s.markNotificationRead);

  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) {
        const state = getMockBankState();
        saveMockBankState({
          ...state,
          notifications: state.notifications.map((n) =>
            n.notifId === notifId ? { ...n, isRead: true } : n,
          ),
        });
        return true;
      }
      return actor.markNotificationRead(notifId);
    },
    onMutate: (notifId) => {
      markRead(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useDismissNotification() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const dismiss = useAppStore((s) => s.dismissNotification);

  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) {
        const state = getMockBankState();
        saveMockBankState({
          ...state,
          notifications: state.notifications.filter((n) => n.notifId !== notifId),
        });
        return true;
      }
      return actor.dismissNotification(notifId);
    },
    onMutate: (notifId) => {
      dismiss(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}
