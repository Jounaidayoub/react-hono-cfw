import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  subtext,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("bg-card/50 border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && (
          <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
        )}
      </CardContent>
    </Card>
  );
}
