import { eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { userProfiles } from "../../../lib/schemas";
import type { UserProfile } from "../../../lib/schemas";
import { err, ok, type Result } from "../../../lib/types";

export async function getAdminUserProfile(
	userId: string,
): Promise<Result<UserProfile>> {
	const profile = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (!profile) {
		return err("NOT_FOUND", "Profile not found");
	}

	return ok(profile);
}

export async function updatePaymentStatus(
	userId: string,
	paymentStatus: "pending" | "paid",
): Promise<Result<UserProfile>> {
	const existing = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (!existing) {
		return err(
			"NOT_FOUND",
			"Profile not found. User has not completed onboarding.",
		);
	}

	const [updated] = await db
		.update(userProfiles)
		.set({ paymentStatus, updatedAt: new Date() })
		.where(eq(userProfiles.userId, userId))
		.returning();

	if (!updated) {
		return err("INTERNAL_ERROR", "Failed to update payment status");
	}

	return ok(updated);
}