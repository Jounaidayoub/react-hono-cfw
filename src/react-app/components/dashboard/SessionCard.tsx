import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  title: string;
  description?: string;
  progress: number; // 0-100
  currentStep?: number;
  totalSteps?: number;
  lastActivity?: string;
  thumbnail?: string;
  variant?: "large" | "small";
  onResume?: () => void;
}

export function SessionCard({
  title,
  description,
  progress,
  currentStep,
  totalSteps,
  lastActivity,
  thumbnail,
  variant = "small",
  onResume,
}: SessionCardProps) {
  const isLarge = variant === "large";

  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 overflow-hidden",
        isLarge && "col-span-2"
      )}
    >
      <CardContent className={cn("p-0", isLarge && "flex gap-4")}>
        {thumbnail && (
          <div
            className={cn(
              "bg-muted flex items-center justify-center relative overflow-hidden",
              isLarge ? "w-48 h-full min-h-[160px]" : "w-full h-24"
            )}
          >
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col justify-center">
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {currentStep && totalSteps && (
            <p className="text-xs text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <div className="flex items-center justify-between mt-3 pt-2">
            <div>
              {lastActivity && (
                <span className="text-xs text-muted-foreground block">
                  {lastActivity}
                </span>
              )}
            </div>
            {onResume && (
              <Button
                size="sm"
                onClick={onResume}
                variant={isLarge ? "default" : "outline"}
                className="ml-auto"
              >
                {isLarge ? "Resume" : "Continue"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
