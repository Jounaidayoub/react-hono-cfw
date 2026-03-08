import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ErrorCode } from "../../lib/types";
import type { ActivityTypeError } from "../modules/activity-types/errors";
import type { AdminError } from "../modules/admin/errors";
import type { EventError } from "../modules/events/errors";
import type { ProfileError } from "../modules/profile/errors";
import type { XpError } from "../modules/xp/errors";

export type ApiErrorType =
	| ErrorCode
	| ActivityTypeError["type"]
	| AdminError["type"]
	| EventError["type"]
	| ProfileError["type"]
	| XpError["type"];

const errorTypeToStatus: Record<ApiErrorType, ContentfulStatusCode> = {
	NOT_FOUND: 404,
	ALREADY_EXISTS: 409,
	VALIDATION_ERROR: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	CONFLICT: 409,
	INTERNAL_ERROR: 500,
	PROFILE_NOT_FOUND: 404,
	PROFILE_CREATE_FAILED: 500,
	PROFILE_UPDATE_FAILED: 500,
	ADMIN_PROFILE_NOT_FOUND: 404,
	ADMIN_PAYMENT_STATUS_UPDATE_FAILED: 500,
	ACTIVITY_TYPE_NOT_FOUND: 404,
	ACTIVITY_TYPE_UPDATE_FAILED: 500,
	EVENT_NOT_FOUND: 404,
	EVENT_CREATE_FAILED: 500,
	EVENT_UPDATE_FAILED: 500,
	XP_ACTIVITY_TYPE_NOT_FOUND: 404,
	XP_ACTIVITY_TYPE_INACTIVE: 409,
	XP_ACTIVITY_ALREADY_AWARDED: 409,
	XP_NOT_AUTHENTICATED: 401,
	XP_EVENT_NOT_FOUND: 404,
	XP_EVENT_NOT_ACTIVE: 409,
	XP_INVALID_CODE: 400,
	XP_CODE_EXPIRED: 409,
	XP_AWARD_FAILED: 500,
};

export function jsonError(
	c: Context,
	error: ApiErrorType,
	details?: unknown,
) {
	return c.json(
		{
			error,
			...(details === undefined ? {} : { details }),
		},
		errorTypeToStatus[error],
	);
}

export function jsonOk<T>(c: Context, data: T, status = 200) {
	return c.json(data, status as ContentfulStatusCode);
}
