import { useSearchParams, Link } from "react-router";
import { XCircle, ArrowRight, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  INVALID_CODE: {
    title: "Invalid QR Code",
    message: "The QR code you scanned is no longer valid. Please ask the organizer to show you the current code.",
  },
  CODE_EXPIRED: {
    title: "QR Code Expired",
    message: "The QR code rotated before you could check in. Please scan the new code.",
  },
  EVENT_NOT_FOUND: {
    title: "Event Not Found",
    message: "This event doesn't exist or has been deleted.",
  },
  EVENT_NOT_ACTIVE: {
    title: "Event Not Active",
    message: "This event hasn't started yet or has already ended.",
  },
  ALREADY_CHECKED_IN: {
    title: "Already Checked In",
    message: "You've already checked in to this event. You can only check in once per event.",
  },
  NOT_AUTHENTICATED: {
    title: "Login Required",
    message: "Please log in to check in to this event.",
  },
};

export default function CheckinError() {
  const [searchParams] = useSearchParams();

  const errorCode = searchParams.get("error") || "UNKNOWN";
  const returnTo = searchParams.get("returnTo");

  const errorInfo = ERROR_MESSAGES[errorCode] || {
    title: "Check-in Failed",
    message: "Something went wrong while trying to check you in. Please try again.",
  };

  const showLoginButton = errorCode === "NOT_AUTHENTICATED";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{errorInfo.message}</p>

          <div className="flex flex-col gap-2">
            {showLoginButton && returnTo ? (
              <Button asChild className="w-full">
                <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
