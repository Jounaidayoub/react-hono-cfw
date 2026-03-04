import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../../lib/db";
import { userProfiles } from "../../../lib/schemas";
import type { ProfileFormData, UserProfile } from "../../../lib/schemas";
import { err, ok, type Result } from "../../../lib/types";

export async function getProfileByUserId(
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

export async function upsertProfile(
	userId: string,
	data: ProfileFormData,
): Promise<Result<{ profile: UserProfile; feesAmount: string }>> {
	const feesAmount = data.status === "FSTM" ? "49 DH" : "79 DH";
	const school = data.status === "FSTM" ? "FSTM" : (data.school ?? "Unknown");
	const now = new Date();

	const existing = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (existing) {
		const [updated] = await db
			.update(userProfiles)
			.set({
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber,
				birthDate: data.birthDate,
				gender: data.gender,
				status: data.status,
				school,
				major: data.major,
				year: data.year,
				feesAmount,
				updatedAt: now,
			})
			.where(eq(userProfiles.userId, userId))
			.returning();

		if (!updated) {
			return err("INTERNAL_ERROR", "Failed to update profile");
		}

		return ok({ profile: updated, feesAmount });
	}

	const [inserted] = await db
		.insert(userProfiles)
		.values({
			id: nanoid(),
			userId,
			firstName: data.firstName,
			lastName: data.lastName,
			phoneNumber: data.phoneNumber,
			birthDate: data.birthDate,
			gender: data.gender,
			status: data.status,
			school,
			major: data.major,
			year: data.year,
			feesAmount,
			paymentStatus: "pending",
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	if (!inserted) {
		return err("INTERNAL_ERROR", "Failed to create profile");
	}

	return ok({ profile: inserted, feesAmount });
}