import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { userProfiles } from "../../../lib/schemas";
import type { UserProfile } from "../../../lib/schemas";
import { error, ok, type Result } from "../../../lib/types";
import type {
	GetAdminUserProfileError,
	UpdatePaymentStatusError,
} from "./errors";

export async function getAdminUserProfile(
	userId: string,
): Promise<Result<UserProfile, GetAdminUserProfileError>> {
	const profile = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (!profile) {
		return error({ type: "ADMIN_PROFILE_NOT_FOUND" });
	}

	return ok(profile);
}

export async function updatePaymentStatus(
	userId: string,
	paymentStatus: "pending" | "paid",
): Promise<Result<UserProfile, UpdatePaymentStatusError>> {
	const existing = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (!existing) {
		return error({ type: "ADMIN_PROFILE_NOT_FOUND" });
	}

	const [updated] = await db
		.update(userProfiles)
		.set({ paymentStatus, updatedAt: new Date() })
		.where(eq(userProfiles.userId, userId))
		.returning();

	if (!updated) {
		return error({ type: "ADMIN_PAYMENT_STATUS_UPDATE_FAILED" });
	}

	return ok(updated);
}