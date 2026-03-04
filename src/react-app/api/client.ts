import type { ApiResponse } from "../../lib/types";

export class ApiError extends Error {
	constructor(
		public code: string,
		message: string,
		public status?: number,
	) {
		super(message);
		this.name = "ApiError";
	}
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

	const json = (await response.json().catch(() => ({}))) as ApiResponse<T> & {
		error?: string;
		code?: string;
	};

	if (!response.ok || json.ok === false) {
		throw new ApiError(
			json.code ?? "UNKNOWN",
			json.error ?? "An unexpected error occurred",
			response.status,
		);
	}

	return json.data;
}