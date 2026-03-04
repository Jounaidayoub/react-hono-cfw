import type { Context } from "hono";

export function globalErrorHandler(err: unknown, c: Context) {
	const normalizedError =
		err instanceof Error ? err : new Error(String(err));

	console.error("Unhandled error:", normalizedError);

	return c.json(
		{
			ok: false,
			error: "Internal server error",
			code: "INTERNAL_ERROR",
		},
		500,
	);
}
