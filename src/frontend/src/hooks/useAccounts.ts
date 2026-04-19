import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AccountType, createActor } from "../backend";
import { createMockAccount, getMockBankState } from "../lib/mockBank";
import { useAppStore } from "../store/useAppStore";
import type { AccountView } from "../types";

export function useAccounts() {
  const { actor, isFetching } = useActor(createActor);
  const setAccounts = useAppStore((s) => s.setAccounts);

  const query = useQuery<AccountView[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return getMockBankState().accounts;
      return actor.getMyAccounts();
    },
    enabled: !isFetching,
    initialData: () => getMockBankState().accounts,
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
      if (!actor) return Promise.resolve(createMockAccount(accountType));
      return actor.createAccount(accountType);
    },
    onSuccess: (account) => {
      if (!actor) {
        queryClient.setQueryData(["accounts"], getMockBankState().accounts);
        return account;
      }
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
