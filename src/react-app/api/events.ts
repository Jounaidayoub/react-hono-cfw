import type {
	Attendee,
	Event,
	EventFormData,
	QRData,
} from "@/lib/schemas/index";
import { apiFetch } from "./client";

function convertToISO(dateStr: string): string {
	return new Date(dateStr).toISOString();
}

function serializeEventData(data: EventFormData) {
	return {
		...data,
		startsAt: convertToISO(data.startsAt),
		endsAt: convertToISO(data.endsAt),
	};
}

function serializePartialEventData(data: Partial<EventFormData>) {
	const converted: Partial<EventFormData> = {};
	if (data.startsAt) converted.startsAt = convertToISO(data.startsAt);
	if (data.endsAt) converted.endsAt = convertToISO(data.endsAt);
	return { ...data, ...converted };
}

export const eventsApi = {
	list: () => apiFetch<Event[]>("/api/events"),
	getById: (id: string) => apiFetch<Event>(`/api/events/${id}`),
	create: (data: EventFormData) =>
		apiFetch<Event>("/api/events", {
			method: "POST",
			body: JSON.stringify(serializeEventData(data)),
		}),
	update: (id: string, data: Partial<EventFormData>) =>
		apiFetch<Event>(`/api/events/${id}`, {
			method: "PATCH",
			body: JSON.stringify(serializePartialEventData(data)),
		}),
	delete: (id: string) =>
		apiFetch<null>(`/api/events/${id}`, {
			method: "DELETE",
		}),
	getQrCode: (id: string) => apiFetch<QRData>(`/api/events/${id}/qr`),
	getAttendees: (id: string) => apiFetch<Attendee[]>(`/api/events/${id}/attendees`),
};
