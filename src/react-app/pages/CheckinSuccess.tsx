import { useSearchParams, Link } from "react-router";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckinSuccess() {
  const [searchParams] = useSearchParams();

  const xpAwarded = searchParams.get("xp") || "100";
  const eventName = searchParams.get("event") || "Event";
  const totalXp = searchParams.get("total");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Check-in Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            You've checked in to <span className="font-medium text-foreground">{decodeURIComponent(eventName)}</span>
          </p>

          <div className="rounded-lg bg-primary/10 p-6">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Zap className="h-6 w-6" />
              <span className="text-3xl font-bold">+{xpAwarded} XP</span>
            </div>
            {totalXp && (
              <p className="mt-2 text-sm text-muted-foreground">
                Total XP: {totalXp}
              </p>
            )}
          </div>

          <Button asChild className="w-full">
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
