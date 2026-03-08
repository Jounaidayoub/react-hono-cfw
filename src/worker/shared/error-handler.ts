import type { Context } from "hono";

export function globalErrorHandler(err: unknown, c: Context) {
	const normalizedError =
		err instanceof Error ? err : new Error(String(err));

	console.error("Unhandled error:", normalizedError);
	// use jsonerror?
	return c.json(
		{
			error: "INTERNAL_ERROR",
		},
		500,
	);
}
