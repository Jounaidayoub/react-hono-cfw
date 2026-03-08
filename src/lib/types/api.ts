export type ErrorCode =
	| "NOT_FOUND"
	| "ALREADY_EXISTS"
	| "VALIDATION_ERROR"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "CONFLICT"
	| "INTERNAL_ERROR";

export type ApiErrorResponse = {
	error: string;
	details?: unknown;
};

export type ApiResponse<T> = T | ApiErrorResponse;
