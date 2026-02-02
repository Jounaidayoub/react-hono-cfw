import { useState, useEffect, useCallback } from "react";
import type { Checkin } from "@/lib/schemas/user-activities";

// Fetch user's total XP
export function useUserXP() {
  const [totalXp, setTotalXp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchXP() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/my/xp");
        if (!response.ok) {
          throw new Error("Failed to fetch XP");
        }
        const data = await response.json();
        setTotalXp(data.totalXp || 0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchXP();
  }, [refetchTrigger]);

  return { totalXp, isLoading, error, refetch };
}

// Fetch user's check-in history
export function useUserCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchCheckins() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/my/checkins");
        if (!response.ok) {
          throw new Error("Failed to fetch check-ins");
        }
        const data = await response.json();
        setCheckins(
          (data.checkins || []).map((c: Record<string, unknown>) => ({
            ...c,
            checkedInAt: new Date(c.checkedInAt as string),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchCheckins();
  }, [refetchTrigger]);

  return { checkins, isLoading, error, refetch };
}

// Combined hook for dashboard data
export function useUserDashboardData() {
  const { totalXp, isLoading: xpLoading, error: xpError, refetch: refetchXp } = useUserXP();
  const { checkins, isLoading: checkinsLoading, error: checkinsError, refetch: refetchCheckins } = useUserCheckins();

  const isLoading = xpLoading || checkinsLoading;
  const error = xpError || checkinsError;

  const refetch = useCallback(() => {
    refetchXp();
    refetchCheckins();
  }, [refetchXp, refetchCheckins]);

  return { totalXp, checkins, isLoading, error, refetch };
}
