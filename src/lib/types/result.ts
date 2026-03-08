

export type Result<T, E = never> =
	| { ok: true; data: T }
	| { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const error = <E>(value: E): Result<never, E> => ({ ok: false, error: value });
export const err = error;

