import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { eventsApi } from "@/api/events";
import type {
	Attendee,
	Event,
	EventFormData,
	QRData,
} from "@/lib/schemas/index";
// use zod to replace all this bs and  use safeParse
function parseEvent(event: Event): Event {
	return {
		...event,
		startsAt: new Date(event.startsAt),
		endsAt: new Date(event.endsAt),
		createdAt: new Date(event.createdAt),
		updatedAt: new Date(event.updatedAt),
		qrExpiresAt: event.qrExpiresAt ? new Date(event.qrExpiresAt) : null,
	};
}

function parseAttendee(attendee: Attendee): Attendee {
	return {
		...attendee,
		checkedInAt: new Date(attendee.checkedInAt),
	};
}

function parseQrData(qrData: QRData): QRData {
	return {
		...qrData,
		expiresAt: new Date(qrData.expiresAt),
	};
}

export function useEvents() {
	const query = useQuery({
		queryKey: ["events"],
		queryFn: async () => (await eventsApi.list()).map(parseEvent),
	});

	return {
		events: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error as Error | null,

	};
}

export function useCreateEvent() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: eventsApi.create,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Event created successfully");
		},
		onError: error => {
			toast.error(error.message);
		},
	});

	return {
		createEvent: async (data: EventFormData): Promise<Event | null> => {
			try {
				const event = await mutation.mutateAsync(data);
				return parseEvent(event);
			} catch {
				return null;
			}
		},
		isLoading: mutation.isPending,
	};
}

export function useUpdateEvent() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) =>
			eventsApi.update(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Event updated successfully");
		},
		onError: error => {
			toast.error(error.message);
		},
	});

	return {
		updateEvent: async (
			id: string,
			data: Partial<EventFormData>,
		): Promise<Event | null> => {
			try {
				const event = await mutation.mutateAsync({ id, data });
				return parseEvent(event);
			} catch {
				return null;
			}
		},
		isLoading: mutation.isPending,
	};
}

export function useDeleteEvent() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: eventsApi.delete,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Event deleted successfully");
		},
		onError: error => {
			toast.error(error.message);
		},
	});

	return {
		deleteEvent: async (id: string): Promise<boolean> => {
			try {
				await mutation.mutateAsync(id);
				return true;
			} catch {
				return false;
			}
		},
		isLoading: mutation.isPending,
	};
}

export function useEventQR(eventId: string | null) {
	const query: UseQueryResult<QRData, Error> = useQuery({
		queryKey: ["events", eventId, "qr"],
		queryFn: async () => parseQrData(await eventsApi.getQrCode(eventId as string)),
		enabled: Boolean(eventId),
		refetchInterval: queryState => {
			const data = queryState.state.data;
			if (!data) {
				return false;
			}

			const ttlMs = data.ttlSeconds * 1000;
			return Math.max(ttlMs - 3000, 1000);
		},
	});

	return {
		qrData: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error ?? null,

	};
}

export function useEventAttendees(eventId: string | null) {
	const query = useQuery({
		queryKey: ["events", eventId, "attendees"],
		queryFn: async () =>
			(await eventsApi.getAttendees(eventId as string)).map(parseAttendee),
		enabled: Boolean(eventId),
	});

	return {
		attendees: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error ?? null,
	};
}
