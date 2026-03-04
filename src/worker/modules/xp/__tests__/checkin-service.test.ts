import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	getEventByIdMock,
	isEventActiveMock,
	awardActivityMock,
	getUserXpMock,
	dbMock,
} = vi.hoisted(() => ({
	getEventByIdMock: vi.fn(),
	isEventActiveMock: vi.fn(),
	awardActivityMock: vi.fn(),
	getUserXpMock: vi.fn(),
	dbMock: {
		select: vi.fn(),
	},
}));

vi.mock("../../../../lib/db", () => ({
	db: dbMock,
}));

vi.mock("../../events/service", () => ({
	getEventById: getEventByIdMock,
	isEventActive: isEventActiveMock,
}));

vi.mock("../service", () => ({
	awardActivity: awardActivityMock,
	getUserXp: getUserXpMock,
}));

import { processCheckin } from "../checkin-service";

describe("checkin service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns UNAUTHORIZED when user is not authenticated", async () => {
		const result = await processCheckin(null, "event_1", "secret_1");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.code).toBe("UNAUTHORIZED");
		}
	});

	it("returns checkin payload on success", async () => {
		getEventByIdMock.mockResolvedValue({
			ok: true,
			data: {
				id: "event_1",
				name: "Weekly Meetup",
				currentQrSecret: "secret_1",
				qrExpiresAt: new Date(Date.now() + 60_000),
				startsAt: new Date(Date.now() - 60_000),
				endsAt: new Date(Date.now() + 60_000),
			},
		});
		isEventActiveMock.mockReturnValue(true);
		awardActivityMock.mockResolvedValue({
			ok: true,
			data: { xpAwarded: 10, activityId: "activity_1" },
		});
		getUserXpMock.mockResolvedValue({ ok: true, data: 50 });

		const result = await processCheckin("user_1", "event_1", "secret_1");

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toEqual({
				xpAwarded: 10,
				eventName: "Weekly Meetup",
				totalXp: 50,
			});
		}
	});
});
