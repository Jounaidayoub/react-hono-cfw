import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, Zap, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/api/events";
import type { ApiClientError } from "@/api/client";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
	XP_INVALID_CODE: {
		title: "Invalid QR Code",
		message:
			"The QR code you scanned is no longer valid. Please ask the organizer to show you the current code.",
	},
	XP_CODE_EXPIRED: {
		title: "QR Code Expired",
		message:
			"The QR code rotated before you could check in. Please scan the new code.",
	},
	XP_EVENT_NOT_FOUND: {
		title: "Event Not Found",
		message: "This event doesn't exist or has been deleted.",
	},
	XP_EVENT_NOT_ACTIVE: {
		title: "Event Not Active",
		message: "This event hasn't started yet or has already ended.",
	},
	XP_ACTIVITY_ALREADY_AWARDED: {
		title: "Already Checked In",
		message:
			"You've already checked in to this event. You can only check in once per event.",
	},
};

function getErrorInfo(error: unknown): { title: string; message: string } {
	const apiError = error as ApiClientError | undefined;
	const type = apiError?.type ?? "UNKNOWN";
	return (
		ERROR_MESSAGES[type] ?? {
			title: "Check-in Failed",
			message:
				"Something went wrong while trying to check you in. Please try again.",
		}
	);
}

export default function CheckinRoute() {
	const { eventId } = useParams<{ eventId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const code = searchParams.get("code");

	const mutation = useMutation({
		mutationFn: async () => {
			try {

				return await eventsApi.checkin(eventId!, code!);

			} catch (error) {
				throw error;
			}
		},
	});

	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		if (!eventId || !code) return;
		if (hasTriggeredRef.current) return;

		hasTriggeredRef.current = true;
		mutation.mutate();
	}, [eventId, code]);

	const handleClose = () => {
		navigate("/dashboard", { replace: true });
	};

	const isLoading = mutation.isPending;
	const isSuccess = mutation.isSuccess;
	const isError = mutation.isError || !eventId || !code;

	const errorInfo = isError ? getErrorInfo(mutation.error) : null;

	return (
		<Dialog open onOpenChange={open => !open && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isLoading
							? "Checking In..."
							: isSuccess
								? "Check-in Successful!"
								: errorInfo?.title ?? "Check-in Error"}
					</DialogTitle>
					<DialogDescription>
						{isLoading
							? "Please wait while we process your check-in."
							: isSuccess
								? `You've checked in to ${mutation.data?.eventName}`
								: errorInfo?.message ?? "An unknown error occurred."}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center gap-4 py-4">
					{isLoading && (
						<div className="flex h-24 items-center justify-center">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
						</div>
					)}

					{isSuccess && mutation.data && (
						<>
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
								<CheckCircle className="h-10 w-10 text-green-500" />
							</div>

							<div className="rounded-lg bg-primary/10 p-6 w-full text-center">
								<div className="flex items-center justify-center gap-2 text-primary">
									<Zap className="h-6 w-6" />
									<span className="text-3xl font-bold">
										+{mutation.data.xpAwarded} XP
									</span>
								</div>
								<p className="mt-2 text-sm text-muted-foreground">
									Total XP: {mutation.data.totalXp}
								</p>
							</div>

							<Button className="w-full" onClick={handleClose}>
								Go to Dashboard
							</Button>
						</>
					)}

					{isError && (
						<>
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
								<XCircle className="h-10 w-10 text-destructive" />
							</div>

							<Button className="w-full" onClick={handleClose}>
								Go to Dashboard
							</Button>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
