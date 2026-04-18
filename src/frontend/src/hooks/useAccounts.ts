import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AccountType, createActor } from "../backend";
import { useAppStore } from "../store/useAppStore";
import type { AccountView } from "../types";

export function useAccounts() {
  const { actor, isFetching } = useActor(createActor);
  const setAccounts = useAppStore((s) => s.setAccounts);

  const query = useQuery<AccountView[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAccounts();
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (query.data) setAccounts(query.data);
  }, [query.data, setAccounts]);

  return query;
}

export function useAccount(accountId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AccountView | null>({
    queryKey: ["account", accountId?.toString()],
    queryFn: async () => {
      if (!actor || !accountId) return null;
      return actor.getAccount(accountId);
    },
    enabled: !!actor && !isFetching && accountId !== null,
  });
}

export function useCreateAccount() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountType: AccountType) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createAccount(accountType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useInitSampleData() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const seededQuery = useQuery<boolean>({
    queryKey: ["sampleDataSeeded"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isSampleDataSeeded();
    },
    enabled: !!actor && !isFetching,
  });

  const initMutation = useMutation({
    mutationFn: () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.initSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return { seededQuery, initMutation };
}

// Export enum value for pages that need it
export { AccountType };
