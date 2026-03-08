export type GetEventByIdError = { type: "EVENT_NOT_FOUND" };

export type CreateEventError = { type: "EVENT_CREATE_FAILED" };

export type UpdateEventError =
	| GetEventByIdError
	| { type: "EVENT_UPDATE_FAILED" };

export type DeleteEventError = GetEventByIdError;

export type GetActiveQrCodeError = GetEventByIdError;

export type EventError =
	| GetEventByIdError
	| CreateEventError
	| UpdateEventError
	| DeleteEventError
	| GetActiveQrCodeError;
