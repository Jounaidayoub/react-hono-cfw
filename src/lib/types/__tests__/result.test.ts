import { describe, expect, it } from "vitest";
import { err, ok, type Result } from "../result";

describe("result helpers", () => {
	it("returns success shape from ok", () => {
		const value = { id: "u_1" };
		const response = ok(value);

		expect(response).toEqual({ ok: true, data: value });
	});

	it("returns error shape from err", () => {
		const response = err("NOT_FOUND", "Missing user", { userId: "u_1" });

		expect(response).toEqual({
			ok: false,
			error: {
				code: "NOT_FOUND",
				message: "Missing user",
				details: { userId: "u_1" },
			},
		});
	});

	it("narrows Result union by ok flag", () => {
		const success: Result<number> = ok(42);

		if (success.ok) {
			expect(success.data).toBe(42);
		} else {
			expect.unreachable("Expected success result");
		}
	});
});
