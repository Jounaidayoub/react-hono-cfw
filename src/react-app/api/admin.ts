import type {
	GetAdminUserProfileError,
	UpdatePaymentStatusError,
} from "../../worker/modules/admin/errors";
import type { UserProfile } from "@/lib/schemas/index";
import {
	apiFetch,
	isApiError,
	type ApiClientError,
	type ValidationApiError,
} from "./client";

export type GetAdminUserProfileApiError = ApiClientError<
	GetAdminUserProfileError["type"]
>;
export type UpdatePaymentStatusApiError = ApiClientError<
	UpdatePaymentStatusError["type"] | ValidationApiError["type"]
>;

const getAdminUserProfileErrorTypes = ["ADMIN_PROFILE_NOT_FOUND"] as const;
const updatePaymentStatusErrorTypes = [
	"ADMIN_PROFILE_NOT_FOUND",
	"ADMIN_PAYMENT_STATUS_UPDATE_FAILED",
	"VALIDATION_ERROR",
] as const;

export function isGetAdminUserProfileApiError(
	error: unknown,
): error is GetAdminUserProfileApiError {
	return isApiError(error, getAdminUserProfileErrorTypes);
}

export function isUpdatePaymentStatusApiError(
	error: unknown,
): error is UpdatePaymentStatusApiError {
	return isApiError(error, updatePaymentStatusErrorTypes);
}

export const adminApi = {
	getUserProfile: (userId: string) =>
		apiFetch<UserProfile>(`/api/admin/users/${userId}/profile`),
	updatePaymentStatus: (userId: string, paymentStatus: "pending" | "paid") =>
		apiFetch<UserProfile>(`/api/admin/users/${userId}/payment-status`, {
			method: "PATCH",
			body: JSON.stringify({ paymentStatus }),
		}),
};
