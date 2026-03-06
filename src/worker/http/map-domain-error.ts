import { assertNever } from "../domain/assert-never";
import type { DomainError } from "../domain/errors";

type HttpErrorResponse = {
  status: number;
  body: { error: string };
};

export function mapDomainErrorToHttp(err: DomainError): HttpErrorResponse {
  switch (err.tag) {
    case "EVENT_NOT_FOUND":
      return { status: 404, body: { error: "Event not found" } };
    case "EVENT_NOT_ACTIVE":
      return { status: 409, body: { error: "Event not active" } };
    case "INVALID_QR_CODE":
      return { status: 400, body: { error: "Invalid QR code" } };
    case "QR_CODE_EXPIRED":
      return { status: 410, body: { error: "QR code expired" } };
    case "ALREADY_CHECKED_IN":
      return { status: 409, body: { error: "Already checked in" } };
    case "PROFILE_NOT_FOUND":
      return { status: 404, body: { error: "Profile not found" } };
    case "INVALID_STATE":
      return { status: 409, body: { error: "Invalid state" } };
    case "INFRASTRUCTURE_ERROR":
      return { status: 500, body: { error: "Internal server error" } };
    default:
      return assertNever(err);
  }
}
