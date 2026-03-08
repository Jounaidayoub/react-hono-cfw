export type GetProfileError = { type: "PROFILE_NOT_FOUND" };

export type UpsertProfileError =
	| { type: "PROFILE_CREATE_FAILED" }
	| { type: "PROFILE_UPDATE_FAILED" };

export type ProfileError = GetProfileError | UpsertProfileError;
