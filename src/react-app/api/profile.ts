import type {
	GetProfileError,
	UpsertProfileError,
} from "../../worker/modules/profile/errors";
import type { ProfileFormData, UserProfile } from "@/lib/schemas/index";
import {
	apiFetch,
	isApiError,
	type ApiClientError,
	type ValidationApiError,
} from "./client";

export type GetProfileApiError = ApiClientError<GetProfileError["type"]>;
export type UpsertProfileApiError = ApiClientError<
	UpsertProfileError["type"] | ValidationApiError["type"]
>;

const getProfileErrorTypes = ["PROFILE_NOT_FOUND"] as const;
const upsertProfileErrorTypes = [
	"PROFILE_CREATE_FAILED",
	"PROFILE_UPDATE_FAILED",
	"VALIDATION_ERROR",
] as const;

export function isGetProfileApiError(error: unknown): error is GetProfileApiError {
	return isApiError(error, getProfileErrorTypes);
}

export function isUpsertProfileApiError(
	error: unknown,
): error is UpsertProfileApiError {
	return isApiError(error, upsertProfileErrorTypes);
}

export const profileApi = {
	get: () => apiFetch<UserProfile>("/api/profile"),
	upsert: (data: ProfileFormData) =>
		apiFetch<{ profile: UserProfile; feesAmount: string }>("/api/profile", {
			method: "POST",
			body: JSON.stringify(data),
		}),
};
