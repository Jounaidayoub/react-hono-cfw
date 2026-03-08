import type { ApiResponse } from "../../lib/types";

export class ApiError extends Error {
	public readonly code: string;
	public readonly type: string;
	public readonly details?: unknown;

	constructor(
		type: string,
		public status?: number,
		details?: unknown,
	) {
		super(type);
		this.name = "ApiError";
		this.type = type;
		this.code = type;
		this.details = details;
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
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

		throw new ApiError(
			getErrorType(json) ?? "UNKNOWN_ERROR",
			response.status,
			details,
		);
	}

	if (json === undefined) {
		return undefined as T;
	}

	return json as T;
}