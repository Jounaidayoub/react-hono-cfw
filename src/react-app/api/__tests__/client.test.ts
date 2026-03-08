import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../client";

describe("apiFetch", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns raw response data for successful requests", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ id: "event_1", name: "Weekly Meetup" }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		const result = await apiFetch<{ id: string; name: string }>("/api/events/event_1");

		expect(result).toEqual({ id: "event_1", name: "Weekly Meetup" });
	});

	it("throws plain typed objects from simplified error responses", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: "EVENT_NOT_FOUND", details: { id: "missing" } }), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				}),
			),
		);

		try {
			await apiFetch("/api/events/missing");
			expect.unreachable("Expected apiFetch to throw");
		} catch (error) {
			expect(error).toEqual({
				type: "EVENT_NOT_FOUND",
				status: 404,
				details: { id: "missing" },
			});
			expect(error).not.toBeInstanceOf(Error);
		}
	});
});