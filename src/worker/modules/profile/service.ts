import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../../lib/db";
import { userProfiles } from "../../../lib/schemas";
import type { ProfileFormData, UserProfile } from "../../../lib/schemas";
import { error, ok, type Result } from "../../../lib/types";
import type { GetProfileError, UpsertProfileError } from "./errors";

export async function getProfileByUserId(
	userId: string,
): Promise<Result<UserProfile, GetProfileError>> {
	const profile = await db
		.select()
		.from(userProfiles)
		.where(eq(userProfiles.userId, userId))
		.get();

	if (!profile) {
		return error({ type: "PROFILE_NOT_FOUND" });
	}

	return ok(profile);
}

export async function upsertProfile(
	userId: string,
	data: ProfileFormData,
): Promise<Result<{ profile: UserProfile; feesAmount: string }, UpsertProfileError>> {
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
			return error({ type: "PROFILE_UPDATE_FAILED" });
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
		return error({ type: "PROFILE_CREATE_FAILED" });
	}

	return ok({ profile: inserted, feesAmount });
}