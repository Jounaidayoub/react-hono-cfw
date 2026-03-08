import { describe, expect, it } from "vitest";
import { error, ok, type Result } from "../result";

describe("result helpers", () => {
	it("returns success shape from ok", () => {
		const value = { id: "u_1" };
		const response = ok(value);

		expect(response).toEqual({ ok: true, data: value });
	});

	it("returns error shape from err", () => {
		const response = error({ type: "EVENT_NOT_FOUND" as const });

		expect(response).toEqual({
			ok: false,
			error: { type: "EVENT_NOT_FOUND" },
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
