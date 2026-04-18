import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import { useAppStore } from "../store/useAppStore";
import type { NotificationView } from "../types";

export function useNotifications() {
  const { actor, isFetching } = useActor(createActor);
  const setNotifications = useAppStore((s) => s.setNotifications);

  const query = useQuery<NotificationView[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
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
      if (!actor) return 0n;
      return actor.getUnreadCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const markRead = useAppStore((s) => s.markNotificationRead);

  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
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
      if (!actor) throw new Error("Actor not ready");
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
