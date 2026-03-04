import type {
	Attendee,
	Event,
	EventFormData,
	QRData,
} from "@/lib/schemas/index";
import { apiFetch } from "./client";

export const eventsApi = {
	list: () => apiFetch<Event[]>("/api/events"),
	getById: (id: string) => apiFetch<Event>(`/api/events/${id}`),
	create: (data: EventFormData) =>
		apiFetch<Event>("/api/events", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	update: (id: string, data: Partial<EventFormData>) =>
		apiFetch<Event>(`/api/events/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),
	delete: (id: string) =>
		apiFetch<null>(`/api/events/${id}`, {
			method: "DELETE",
		}),
	getQrCode: (id: string) => apiFetch<QRData>(`/api/events/${id}/qr`),
	getAttendees: (id: string) => apiFetch<Attendee[]>(`/api/events/${id}/attendees`),
};
