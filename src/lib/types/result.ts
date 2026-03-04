export type ErrorCode =
	| "NOT_FOUND"
	| "ALREADY_EXISTS"
	| "VALIDATION_ERROR"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "CONFLICT"
	| "INTERNAL_ERROR";

export type AppError = {
	code: ErrorCode;
	message: string;
	details?: unknown;
};

export type Result<T, E = AppError> =
	| { ok: true; data: T }
	| { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
	return { ok: true, data };
}

export function err(
	code: ErrorCode,
	message: string,
	details?: unknown,
): Result<never, AppError> {
	return { ok: false, error: { code, message, details } };
}
