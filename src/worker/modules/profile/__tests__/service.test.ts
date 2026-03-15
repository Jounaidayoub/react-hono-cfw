import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
	dbMock: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
	},
}));

vi.mock("../../../../lib/db", () => ({
	db: dbMock,
}));

vi.mock("nanoid", () => ({
	nanoid: () => "profile_1",
}));

import { getProfileByUserId, upsertProfile } from "../service";

function mockSelectGet(value: unknown) {
	const get = vi.fn().mockResolvedValue(value);
	const where = vi.fn(() => ({ get }));
	const from = vi.fn(() => ({ where }));
	dbMock.select.mockReturnValue({ from });
	return { get, where, from };
}

describe("profile service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		const where = vi.fn().mockResolvedValue(undefined);
		const set = vi.fn(() => ({ where }));
		dbMock.update.mockReturnValue({ set });
	});

	it("returns NOT_FOUND when profile does not exist", async () => {
		mockSelectGet(undefined);

		const result = await getProfileByUserId("user_1");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("PROFILE_NOT_FOUND");
		}
	});

	it("creates profile and computes FSTM fees", async () => {
		mockSelectGet(undefined);

		const insertedProfile = {
			id: "profile_1",
			userId: "user_1",
			firstName: "Ada",
			lastName: "Lovelace",
			phoneNumber: "0612345678",
			birthDate: "2000-01-01",
			gender: "Female",
			status: "FSTM",
			school: "FSTM",
			major: "SMI",
			year: "3eme",
			feesAmount: "49 DH",
			paymentStatus: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const returning = vi.fn().mockResolvedValue([insertedProfile]);
		const values = vi.fn(() => ({ returning }));
		dbMock.insert.mockReturnValue({ values });

		const result = await upsertProfile("user_1", {
			firstName: "Ada",
			lastName: "Lovelace",
			phoneNumber: "0612345678",
			birthDate: "2000-01-01",
			gender: "Female",
			status: "FSTM",
			school: "External School",
			major: "SMI",
			year: "3eme",
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.feesAmount).toBe("49 DH");
			expect(result.data.profile.school).toBe("FSTM");
		}
	});
});
