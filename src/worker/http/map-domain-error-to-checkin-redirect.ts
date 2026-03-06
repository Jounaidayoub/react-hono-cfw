import { assertNever } from "../domain/assert-never";
import type { DomainError } from "../domain/errors";

/**
 * Maps a DomainError to a redirect path for the check-in flow.
 * Returns a relative URL like /checkin/error?error=EVENT_NOT_FOUND
 */
export function mapDomainErrorToCheckinRedirect(err: DomainError): string {
  switch (err.tag) {
    case "EVENT_NOT_FOUND":
      return "/checkin/error?error=EVENT_NOT_FOUND";
    case "EVENT_NOT_ACTIVE":
      return "/checkin/error?error=EVENT_NOT_ACTIVE";
    case "INVALID_QR_CODE":
      return "/checkin/error?error=INVALID_CODE";
    case "QR_CODE_EXPIRED":
      return "/checkin/error?error=CODE_EXPIRED";
    case "ALREADY_CHECKED_IN":
      return "/checkin/error?error=ALREADY_CHECKED_IN";
    case "PROFILE_NOT_FOUND":
    case "INVALID_STATE":
    case "INFRASTRUCTURE_ERROR":
      return "/checkin/error?error=INTERNAL_ERROR";
    default:
      return assertNever(err);
  }
}
