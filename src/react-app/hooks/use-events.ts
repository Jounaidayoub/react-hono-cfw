import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type {
  Event,
  EventFormData,
  QRData,
  Attendee,
} from "@/lib/schemas/events";

// Parse event dates from API response
function parseEvent(event: Record<string, unknown>): Event {
  return {
    ...event,
    startsAt: new Date(event.startsAt as string),
    endsAt: new Date(event.endsAt as string),
    createdAt: new Date(event.createdAt as string),
    updatedAt: new Date(event.updatedAt as string),
    currentQrSecret: (event.currentQrSecret as string | null) ?? null,
    qrExpiresAt: event.qrExpiresAt
      ? new Date(event.qrExpiresAt as string)
      : null,
  } as Event;
}

// Fetch all events
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents((data || []).map(parseEvent));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, [refetchTrigger]);

  return { events, isLoading, error, refetch };
}

// Create event mutation
export function useCreateEvent() {
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = useCallback(
    async (data: EventFormData): Promise<Event | null> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            startsAt: new Date(data.startsAt).toISOString(),
            endsAt: new Date(data.endsAt).toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create event");
        }

        const result = await response.json();
        toast.success("Event created successfully");
        return parseEvent(result);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to create event";
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { createEvent, isLoading };
}

// Update event mutation
export function useUpdateEvent() {
  const [isLoading, setIsLoading] = useState(false);

  const updateEvent = useCallback(
    async (id: string, data: Partial<EventFormData>): Promise<Event | null> => {
      setIsLoading(true);
      try {
        const payload: Record<string, unknown> = { ...data };
        if (data.startsAt) {
          payload.startsAt = new Date(data.startsAt).toISOString();
        }
        if (data.endsAt) {
          payload.endsAt = new Date(data.endsAt).toISOString();
        }

        const response = await fetch(`/api/events/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update event");
        }

        const result = await response.json();
        toast.success("Event updated successfully");
        return parseEvent(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update event";
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { updateEvent, isLoading };
}

// Delete event mutation
export function useDeleteEvent() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      toast.success("Event deleted successfully");
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteEvent, isLoading };
}

// Fetch QR code with auto-refresh
export function useEventQR(eventId: string | null) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQR = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/qr`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch QR code");
      }
      const data = await response.json();
      setQrData({
        ...data,
        expiresAt: new Date(data.expiresAt),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Fetch immediately when eventId changes
  useEffect(() => {
    if (eventId) {
      fetchQR();
    } else {
      setQrData(null);
    }
  }, [eventId, fetchQR]);

  // Auto-refresh 3 seconds before expiry
  useEffect(() => {
    if (!qrData || !eventId) return;

    const refreshTime = qrData.ttlSeconds * 1000 - 3000;
    if (refreshTime <= 0) {
      fetchQR();
      return;
    }

    const timer = setTimeout(fetchQR, refreshTime);
    return () => clearTimeout(timer);
  }, [qrData, eventId, fetchQR]);

  return { qrData, isLoading, error, refetch: fetchQR };
}

// Fetch event attendees
export function useEventAttendees(eventId: string | null) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setAttendees([]);
      return;
    }

    async function fetchAttendees() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/events/${eventId}/attendees`);
        if (!response.ok) {
          throw new Error("Failed to fetch attendees");
        }
        const data = await response.json();
        setAttendees(
          (data || []).map((a: Record<string, unknown>) => ({
            ...a,
            checkedInAt: new Date(a.checkedInAt as string),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendees();
  }, [eventId]);

  return { attendees, isLoading, error };
}
