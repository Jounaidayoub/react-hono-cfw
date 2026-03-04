import type { UserProfile } from "@/lib/schemas/index";
import { apiFetch } from "./client";

export const adminApi = {
	getUserProfile: (userId: string) =>
		apiFetch<UserProfile>(`/api/admin/users/${userId}/profile`),
	updatePaymentStatus: (userId: string, paymentStatus: "pending" | "paid") =>
		apiFetch<UserProfile>(`/api/admin/users/${userId}/payment-status`, {
			method: "PATCH",
			body: JSON.stringify({ paymentStatus }),
		}),
};
