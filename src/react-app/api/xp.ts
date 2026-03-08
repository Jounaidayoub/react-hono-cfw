import type { Checkin } from "@/lib/schemas/index";
import { apiFetch } from "./client";

export const xpApi = {
	getTotal: () => apiFetch<number>("/api/my/xp"),
	getCheckins: () => apiFetch<Checkin[]>("/api/my/checkins"),
};
