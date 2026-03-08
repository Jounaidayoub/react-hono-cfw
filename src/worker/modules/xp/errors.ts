export type AwardActivityError =
	| { type: "XP_ACTIVITY_TYPE_NOT_FOUND" }
	| { type: "XP_ACTIVITY_TYPE_INACTIVE" }
	| { type: "XP_ACTIVITY_ALREADY_AWARDED" };

export type ProcessCheckinError =
	| { type: "XP_NOT_AUTHENTICATED" }
	| { type: "XP_EVENT_NOT_FOUND" }
	| { type: "XP_EVENT_NOT_ACTIVE" }
	| { type: "XP_INVALID_CODE" }
	| { type: "XP_CODE_EXPIRED" }
	| { type: "XP_ACTIVITY_ALREADY_AWARDED" }
	| { type: "XP_AWARD_FAILED" }

export type XpError = AwardActivityError | ProcessCheckinError;
