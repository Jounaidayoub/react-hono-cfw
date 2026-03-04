import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppError, ErrorCode } from "../../lib/types";

const errorCodeToStatus: Record<ErrorCode, ContentfulStatusCode> = {
	NOT_FOUND: 404,
	ALREADY_EXISTS: 409,
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	CONFLICT: 409,
	INTERNAL_ERROR: 500,
	
};

export function jsonErr(c: Context, error: AppError) {
	const status = errorCodeToStatus[error.code] ?? 500;
	return c.json({ ok: false, error: error.message, code: error.code }, status);
}

export function jsonOk<T>(c: Context, data: T) {
	return c.json({ ok: true, data }, 200);
}

export function jsonCreated<T>(c: Context, data: T) {
	return c.json({ ok: true, data }, 201);
}

export function jsonValidationErr(c: Context, zodError: unknown) {
	return c.json(
		{
			ok: false,
			error: "Validation failed",
			code: "VALIDATION_ERROR",
			details: zodError,
		},
		400,
	);
}
