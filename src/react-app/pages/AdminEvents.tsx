import { useState } from "react";
import { Plus, QrCode, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EventFormDialog } from "@/components/admin/EventFormDialog";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useEventAttendees,
} from "@/hooks/use-events";
import {
  getEventStatus,
  type Event,
  type EventFormData,
} from "@/lib/schemas/events";

export default function AdminEvents() {
  const { events, isLoading, refetch } = useEvents();
  const { createEvent, isLoading: isCreating } = useCreateEvent();
  const { updateEvent, isLoading: isUpdating } = useUpdateEvent();
  const { deleteEvent, isLoading: isDeleting } = useDeleteEvent();

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attendeesOpen, setAttendeesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleCreate = () => {
    setSelectedEvent(null);
    setFormOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormOpen(true);
  };

  const handleShowQR = (event: Event) => {
    setSelectedEvent(event);
    setQrOpen(true);
  };

  const handleShowAttendees = (event: Event) => {
    setSelectedEvent(event);
    setAttendeesOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: EventFormData) => {
    if (selectedEvent) {
      const result = await updateEvent(selectedEvent.id, data);
      if (result) refetch();
    } else {
      const result = await createEvent(data);
      if (result) refetch();
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEvent) {
      const success = await deleteEvent(selectedEvent.id);
      if (success) {
        refetch();
        setDeleteOpen(false);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "ended":
        return <Badge variant="outline" className="text-muted-foreground">Ended</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage meetup events and QR codes for check-ins
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No events yet. Create your first event to get started.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.location || "-"}
                  </TableCell>
                  <TableCell>{formatDate(event.startsAt)}</TableCell>
                  <TableCell>{formatDate(event.endsAt)}</TableCell>
                  <TableCell>{getStatusBadge(event)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShowQR(event)}
                        title="Show QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShowAttendees(event)}
                        title="View Attendees"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                        title="Edit Event"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(event)}
                        title="Delete Event"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={selectedEvent}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        event={selectedEvent}
      />

      {/* Attendees Dialog */}
      <AttendeesDialog
        open={attendeesOpen}
        onOpenChange={setAttendeesOpen}
        event={selectedEvent}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Attendees Dialog Component
function AttendeesDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}) {
  const { attendees, isLoading } = useEventAttendees(open ? event?.id ?? null : null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Event Attendees</DialogTitle>
          <DialogDescription>
            {event?.name} - {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : attendees.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No attendees yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Checked In</TableHead>
                  <TableHead className="text-right">XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {attendee.userName || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(attendee.checkedInAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      +{attendee.xpAwarded}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
