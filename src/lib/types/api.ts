export type ApiSuccessResponse<T> = {
	ok: true;
	data: T;
};

export type ApiErrorResponse = {
	ok: false;
	error: string;
	code: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
