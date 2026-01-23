
export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: "user" | "admin";
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
    banned: boolean;
    banReason?: string | null;
    banExpires?: string | null;
    image?: string | null;
}
export interface ListUsersResponse {
    users: User[];
    total: number;
    limit?: number;
    offset?: number;
}

export interface ListUsersQuery {
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
}
