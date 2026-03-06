export type DomainError =
  | { tag: "EVENT_NOT_FOUND"; eventId: string }
  | { tag: "EVENT_NOT_ACTIVE"; eventId: string; now: Date }
  | { tag: "INVALID_QR_CODE"; eventId: string }
  | { tag: "QR_CODE_EXPIRED"; eventId: string; expiredAt: Date | null }
  | { tag: "ALREADY_CHECKED_IN"; userId: string; eventId: string }
  | { tag: "PROFILE_NOT_FOUND"; userId: string }
  | { tag: "INVALID_STATE"; message: string }
  | { tag: "INFRASTRUCTURE_ERROR"; operation: string; cause?: unknown };
