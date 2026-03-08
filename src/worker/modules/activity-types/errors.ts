export type GetActivityTypeError = { type: "ACTIVITY_TYPE_NOT_FOUND" };

export type UpdateActivityTypeError =
	| { type: "ACTIVITY_TYPE_NOT_FOUND" }
	| { type: "ACTIVITY_TYPE_UPDATE_FAILED" };

export type ActivityTypeError = GetActivityTypeError | UpdateActivityTypeError;
