import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
	dbMock: {
		select: vi.fn(),
		update: vi.fn(),
	},
}));

vi.mock("../../../../lib/db", () => ({
	db: dbMock,
}));

import { getAdminUserProfile, updatePaymentStatus } from "../service";

function mockSelectGet(value: unknown) {
	const get = vi.fn().mockResolvedValue(value);
	const where = vi.fn(() => ({ get }));
	const from = vi.fn(() => ({ where }));
	dbMock.select.mockReturnValue({ from });
	return { get };
}

describe("admin service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns NOT_FOUND when admin asks for missing profile", async () => {
		mockSelectGet(undefined);

		const result = await getAdminUserProfile("user_missing");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("ADMIN_PROFILE_NOT_FOUND");
		}
	});

	it("updates payment status when profile exists", async () => {
		mockSelectGet({ id: "profile_1", userId: "user_1" });

		const updatedProfile = {
			id: "profile_1",
			userId: "user_1",
			paymentStatus: "paid",
			updatedAt: new Date(),
		};
		const returning = vi.fn().mockResolvedValue([updatedProfile]);
		const where = vi.fn(() => ({ returning }));
		const set = vi.fn(() => ({ where }));
		dbMock.update.mockReturnValue({ set });

		const result = await updatePaymentStatus("user_1", "paid");

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.paymentStatus).toBe("paid");
		}
	});
});
