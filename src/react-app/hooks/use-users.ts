import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import type { User, ListUsersQuery } from "@/types/user";

export function useUsers(query: ListUsersQuery = {}) {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        async function fetchUsers() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await authClient.admin.listUsers({
                    query: {
                        limit: query.limit || 10,
                        offset: query.offset || 0,
                        searchField: query.searchField,
                        searchValue: query.searchValue,
                        searchOperator: query.searchOperator,
                        sortBy: query.sortBy,
                        sortDirection: query.sortDirection,
                        filterField: query.filterField,
                        filterValue: query.filterValue,
                        filterOperator: query.filterOperator,
                    }
                });

                if (response.error) {
                    throw new Error(response.error.message || "Failed to fetch users");
                }
                
                const data = response.data;
                
                if (data) {
                    setUsers(data.users as User[]);
                    setTotal(data.total);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, [
        query.limit,
        query.offset,
        query.searchValue,
        query.searchField,
        query.sortBy,
        query.sortDirection,
        query.filterField,
        query.filterValue,
        refetchTrigger,
    ]);

    return { users, total, isLoading, error, refetch };
}
