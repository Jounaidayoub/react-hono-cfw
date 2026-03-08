import type { ApiResponse } from "../../lib/types";

export type ApiClientError<TType extends string = string> = {
	type: TType;
	status: number;
	details?: unknown;
};

export type ValidationApiError = ApiClientError<"VALIDATION_ERROR">;

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function isApiError<TType extends string>(
	value: unknown,
	types: readonly TType[],
): value is ApiClientError<TType> {
	return (
		isObject(value) &&
		typeof value.type === "string" &&
		typeof value.status === "number" &&
		types.includes(value.type as TType)
	);
}

function getErrorType(value: unknown): string | undefined {
	if (!isObject(value)) {
		return undefined;
	}

	if (typeof value.error === "string") {
		return value.error;
	}

	if (typeof value.code === "string") {
		return value.code;
	}

	return undefined;
}

// TODO: Refactor apiFetch to return a Result<T, E> type to avoid throwing exceptions
// This will align with the worker implementation and force exhaustive error handling
// on the client side using discriminated unions and switch-case on error types.
export async function apiFetch<T>(
	url: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
		...options,
	});

	if (response.status === 204) {
		return undefined as T;
	}

	const json = (await response.json().catch(() => undefined)) as
		| ApiResponse<T>
		| undefined;

	if (!response.ok) {
		const details =
			isObject(json) && "details" in json ? json.details : undefined;

		throw {
			type: getErrorType(json) ?? "UNKNOWN_ERROR",
			status: response.status,
			...(details === undefined ? {} : { details }),
		} satisfies ApiClientError;
	}

	if (json === undefined) {
		return undefined as T;
	}

	return json as T;
}