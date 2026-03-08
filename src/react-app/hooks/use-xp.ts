import { useQuery } from "@tanstack/react-query";
import { xpApi } from "@/api/xp";
import type { Checkin } from "@/lib/schemas/index";

function parseCheckin(checkin: Checkin): Checkin {
	return {
		...checkin,
		checkedInAt: new Date(checkin.checkedInAt),
	};
}

export function useUserXP() {
	const query = useQuery({
		queryKey: ["xp"],
		queryFn: xpApi.getTotal,
	});

	return {
		totalXp: query.data ?? 0,
		isLoading: query.isLoading,
		error: query.error ?? null,
		refetch: () => {
			void query.refetch();
		},
	};
}

export function useUserCheckins() {
	const query = useQuery({
		queryKey: ["checkins"],
		queryFn: async () => (await xpApi.getCheckins()).map(parseCheckin),
	});

	return {
		checkins: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error ?? null,
		refetch: () => {
			void query.refetch();
		},
	};
}

export function useUserDashboardData() {
	const xp = useUserXP();
	const checkins = useUserCheckins();

	return {
		totalXp: xp.totalXp,
		checkins: checkins.checkins,
		isLoading: xp.isLoading || checkins.isLoading,
		error: xp.error || checkins.error,
		refetch: () => {
			xp.refetch();
			checkins.refetch();
		},
	};
}
