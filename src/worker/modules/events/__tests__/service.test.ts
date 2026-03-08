import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
	dbMock: {
		select: vi.fn(),
		insert: vi.fn(),
	},
}));

vi.mock("../../../../lib/db", () => ({
	db: dbMock,
}));

vi.mock("nanoid", () => ({
	nanoid: () => "event_1",
}));

import { createEvent, getEventById } from "../service";

function mockSelectGet(value: unknown) {
	const get = vi.fn().mockResolvedValue(value);
	const where = vi.fn(() => ({ get }));
	const from = vi.fn(() => ({ where }));
	dbMock.select.mockReturnValue({ from });
	return { get };
}

describe("events service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns NOT_FOUND when event does not exist", async () => {
		mockSelectGet(undefined);

		const result = await getEventById("missing_event");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("EVENT_NOT_FOUND");
		}
	});

	it("creates event and returns created record", async () => {
		const values = vi.fn().mockResolvedValue(undefined);
		dbMock.insert.mockReturnValue({ values });

		const createdEvent = {
			id: "event_1",
			name: "Weekly Meetup",
			description: "desc",
			startsAt: new Date("2026-03-05T10:00:00Z"),
			endsAt: new Date("2026-03-05T12:00:00Z"),
			createdBy: "admin_1",
			currentQrSecret: null,
			qrExpiresAt: null,
			qrRotationSeconds: 30,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		mockSelectGet(createdEvent);

		const result = await createEvent(
			{
				name: "Weekly Meetup",
				description: "desc",
				startsAt: new Date("2026-03-05T10:00:00Z"),
				endsAt: new Date("2026-03-05T12:00:00Z"),
				qrRotationSeconds: 30,
				currentQrSecret: null,
				qrExpiresAt: null,
			},
			"admin_1",
		);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.id).toBe("event_1");
		}
	});
});
