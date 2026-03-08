export type GetAdminUserProfileError = { type: "ADMIN_PROFILE_NOT_FOUND" };

export type UpdatePaymentStatusError =
	| { type: "ADMIN_PROFILE_NOT_FOUND" }
	| { type: "ADMIN_PAYMENT_STATUS_UPDATE_FAILED" };

export type AdminError = GetAdminUserProfileError | UpdatePaymentStatusError;
