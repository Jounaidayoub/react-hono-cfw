import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { jsonError, jsonOk } from "../response";

describe("response helpers", () => {
	it("returns raw success data with explicit status", async () => {
		const app = new Hono();

		app.get("/", c => jsonOk(c, { id: "event_1" }, 201));

		const response = await app.request("/");
		const json = await response.json();

		expect(response.status).toBe(201);
		expect(json).toEqual({ id: "event_1" });
	});

	it("maps error type to status internally", async () => {
		const app = new Hono();

		app.get("/", c => jsonError(c, "EVENT_NOT_FOUND"));

		const response = await app.request("/");
		const json = await response.json();

		expect(response.status).toBe(404);
		expect(json).toEqual({ error: "EVENT_NOT_FOUND" });
	});

	it("includes optional details in error responses", async () => {
		const app = new Hono();

		app.get("/", c => jsonError(c, "VALIDATION_ERROR", [{ path: ["name"] }]));

		const response = await app.request("/");
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json).toEqual({
			error: "VALIDATION_ERROR",
			details: [{ path: ["name"] }],
		});
	});
});