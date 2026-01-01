import * as React from "react";

interface AchievementItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  xpReward: number;
}

export function AchievementItem({
  icon,
  title,
  description,
  xpReward,
}: AchievementItemProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-primary border border-border/50">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded-full">
        +{xpReward} XP
      </span>
    </div>
  );
}
