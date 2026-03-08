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

import { getActivityTypeById, updateActivityType } from "../service";

function mockSelectGet(value: unknown) {
	const get = vi.fn().mockResolvedValue(value);
	const where = vi.fn(() => ({ get }));
	const from = vi.fn(() => ({ where }));
	dbMock.select.mockReturnValue({ from });
	return { get };
}

describe("activity-types service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns NOT_FOUND when activity type is missing", async () => {
		mockSelectGet(undefined);

		const result = await getActivityTypeById("missing_type");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("ACTIVITY_TYPE_NOT_FOUND");
		}
	});

	it("updates existing activity type", async () => {
		dbMock.select
			.mockReturnValueOnce({
				from: vi.fn(() => ({
					where: vi.fn(() => ({
						get: vi.fn().mockResolvedValue({ id: "type_1" }),
					})),
				})),
			});

		const updated = {
			id: "type_1",
			code: "MEETUP_ATTENDANCE",
			name: "Meetup attendance",
			xpValue: 10,
			isActive: true,
		};
		const returning = vi.fn().mockResolvedValue([updated]);
		const where = vi.fn(() => ({ returning }));
		const set = vi.fn(() => ({ where }));
		dbMock.update.mockReturnValue({ set });

		const result = await updateActivityType("type_1", { xpValue: 10 });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.id).toBe("type_1");
		}
	});
});
