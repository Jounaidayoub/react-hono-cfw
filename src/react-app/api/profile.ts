import type { ProfileFormData, UserProfile } from "@/lib/schemas/index";
import { apiFetch } from "./client";

export const profileApi = {
	get: () => apiFetch<UserProfile>("/api/profile"),
	upsert: (data: ProfileFormData) =>
		apiFetch<{ profile: UserProfile; feesAmount: string }>("/api/profile", {
			method: "POST",
			body: JSON.stringify(data),
		}),
};
