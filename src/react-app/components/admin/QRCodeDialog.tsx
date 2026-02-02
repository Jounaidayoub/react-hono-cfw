import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventQR } from "@/hooks/use-events";
import type { Event } from "@/lib/schemas/events";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function QRCodeDialog({ open, onOpenChange, event }: QRCodeDialogProps) {
  const { qrData, isLoading, error } = useEventQR(open ? event?.id ?? null : null);
  const [countdown, setCountdown] = useState(0);

  // Update countdown every second
  useEffect(() => {
    if (!qrData) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const remaining = Math.max(
        0,
        Math.floor((qrData.expiresAt.getTime() - now.getTime()) / 1000)
      );
      setCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [qrData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>
            {event?.name} - Display this QR code for attendees to scan
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {isLoading ? (
            <Skeleton className="h-64 w-64 rounded-lg" />
          ) : error ? (
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-destructive bg-destructive/10 text-destructive">
              <p className="text-center px-4">{error.message}</p>
            </div>
          ) : qrData ? (
            <>
              <div className="rounded-lg bg-white p-4">
                <QRCodeSVG
                  value={qrData.qrContent}
                  size={240}
                  level="M"
                  marginSize={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={countdown <= 5 ? "destructive" : "secondary"}
                  className="text-lg px-4 py-1 tabular-nums"
                >
                  {countdown}s
                </Badge>
                <span className="text-sm text-muted-foreground">
                  until rotation
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                QR code rotates every {qrData.rotationSeconds} seconds for
                security
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
