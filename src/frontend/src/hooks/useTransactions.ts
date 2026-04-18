import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import { useAppStore } from "../store/useAppStore";
import type {
  Transaction,
  TransactionPage,
  TransferRequest,
  TransferResult,
} from "../types";

export function useTransactions(
  accountId: bigint | null,
  offset = 0n,
  limit = 20n,
) {
  const { actor, isFetching } = useActor(createActor);
  const setTransactions = useAppStore((s) => s.setTransactions);

  const query = useQuery<TransactionPage>({
    queryKey: ["transactions", accountId?.toString(), offset.toString()],
    queryFn: async () => {
      if (!actor || !accountId)
        return { transactions: [], total: 0n, hasMore: false };
      return actor.getTransactions(accountId, offset, limit);
    },
    enabled: !!actor && !isFetching && accountId !== null,
  });

  useEffect(() => {
    if (query.data?.transactions) setTransactions(query.data.transactions);
  }, [query.data, setTransactions]);

  return query;
}

export function useTransaction(txId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Transaction | null>({
    queryKey: ["transaction", txId?.toString()],
    queryFn: async () => {
      if (!actor || !txId) return null;
      return actor.getTransaction(txId);
    },
    enabled: !!actor && !isFetching && txId !== null,
  });
}

export function useTransfer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<TransferResult, Error, TransferRequest>({
    mutationFn: async (req: TransferRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.transfer(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
