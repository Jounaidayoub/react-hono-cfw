import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
	dbMock: {
		select: vi.fn(),
		insert: vi.fn(),
		delete: vi.fn(),
	},
}));

vi.mock("../../../../lib/db", () => ({
	db: dbMock,
}));

vi.mock("nanoid", () => ({
	nanoid: () => "activity_1",
}));

import { awardActivity } from "../service";

function mockSelectGet(value: unknown) {
	const get = vi.fn().mockResolvedValue(value);
	const where = vi.fn(() => ({ get }));
	const from = vi.fn(() => ({ where }));
	dbMock.select.mockReturnValue({ from });
	return { get };
}

describe("xp service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns NOT_FOUND when activity type does not exist", async () => {
		mockSelectGet(undefined);

		const result = await awardActivity("user_1", "MEETUP_ATTENDANCE");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("XP_ACTIVITY_TYPE_NOT_FOUND");
		}
	});

	it("returns CONFLICT when activity already awarded", async () => {
		mockSelectGet({ id: "type_1", isActive: true, xpValue: 10 });

		const returning = vi.fn().mockResolvedValue([]);
		const onConflictDoNothing = vi.fn(() => ({ returning }));
		const values = vi.fn(() => ({ onConflictDoNothing }));
		dbMock.insert.mockReturnValue({ values });

		const result = await awardActivity(
			"user_1",
			"MEETUP_ATTENDANCE",
			"event_1",
			"event",
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("XP_ACTIVITY_ALREADY_AWARDED");
		}
	});
});
