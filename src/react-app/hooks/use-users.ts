import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins/admin";

export type AppRole = "user" | "admin";

export type AppUser = Omit<UserWithRole, "role"> & {
	role?: AppRole;
};

export type AppUserWithRole = AppUser;

export type ListUsersQuery = {
	limit?: number;
	offset?: number;
	searchValue?: string;
	searchField?: "name" | "email";
	searchOperator?: "contains" | "starts_with" | "ends_with";
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	filterField?: string;
	filterValue?: string | number | boolean;
	filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte";
};



export function useUsers(query: ListUsersQuery = {}) {
	const usersQuery = useQuery({
		queryKey: ["users", query],
		queryFn: async (): Promise<{ users: AppUser[]; total: number }> => {
			const response = await authClient.admin.listUsers({
				query: {
					limit: query.limit ?? 10,
					offset: query.offset ?? 0,
					searchField: query.searchField,
					searchValue: query.searchValue,
					searchOperator: query.searchOperator,
					sortBy: query.sortBy,
					sortDirection: query.sortDirection,
					filterField: query.filterField,
					filterValue: query.filterValue,
					filterOperator: query.filterOperator,
				},
			});

			if (response.error) {
				throw new Error(response.error.message || "Failed to fetch users");
			}

			const users: AppUser[] = (response.data?.users ?? []).map(user => {
				const { role, ...rest } = user;
				const normalizedRole: AppRole | undefined =
					role === "admin" ? "admin" : role === "user" ? "user" : undefined;

				return {
					...rest,
					role: normalizedRole,
				};
			});

			return {
				users,
				total: response.data?.total ?? 0,
			};
		},
	});

	return {
		users: usersQuery.data?.users ?? [],
		total: usersQuery.data?.total ?? 0,
		isLoading: usersQuery.isLoading,
		error: usersQuery.error ?? null,
		refetch: () => {
			void usersQuery.refetch();
		},
	};
}
