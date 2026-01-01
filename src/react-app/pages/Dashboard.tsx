import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-context";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { AchievementItem } from "@/components/dashboard/AchievementItem";
import { Zap, Trophy, Flame, CheckCircle, Code, Plus } from "lucide-react";

// Mock data - will be replaced with API calls
const mockSessions = [
  {
    id: "1",
    title: "Project SumoBot: Chassis...",
    description:
      "Learn to assemble the drive train, attach motors, and calibrate the torque sensors.",
    progress: 40,
    currentStep: 4,
    totalSteps: 10,
    lastActivity: "2h ago",
    thumbnail:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  },
  {
    id: "2",
    title: "Circuit Logic",
    description: "Logic Gates Fundamentals",
    progress: 60,
    lastActivity: "Yesterday",
  },
  {
    id: "3",
    title: "Python AI",
    description: "Neural Networks Intro",
    progress: 25,
    lastActivity: "3 days ago",
  },
  {
    id: "4",
    title: "3D CAD",
    description: "Fusion 360 Basics",
    progress: 75,
    lastActivity: "1 week ago",
  },
];

const mockAchievements = [
  {
    id: "1",
    title: "Python Basics Completed",
    description: "Mastered loops and functions.",
    xpReward: 150,
  },
];

export default function Dashboard() {
  const { profile, session } = useAuth();

  const firstName =
    profile?.firstName || session?.user?.name?.split(" ")[0] || "Builder";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ready to build, <span className="text-primary">{firstName}{" "}</span>?
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Your robotics journey continues. Here's your daily briefing.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Zap className="h-4 w-4" />}
          label="Total XP"
          value="2,400"
          subtext="↗ +150 this week"
        />
        <StatsCard
          icon={<Trophy className="h-4 w-4" />}
          label="Current Rank"
          value="Senior Builder"
          subtext="300 XP to Master"
        />
        <StatsCard
          icon={<Flame className="h-4 w-4" />}
          label="Day Streak"
          value="5"
          subtext="Best streak: 12 days"
        />
        <StatsCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Completed"
          value="12"
          subtext="Modules finished"
        />
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Sessions
          </h2>
          <Button
            variant="link"
            className="text-primary p-0 h-auto font-medium"
          >
            View all sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3 lg:col-span-2">
            <SessionCard
              title={mockSessions[0].title}
              description={mockSessions[0].description}
              progress={mockSessions[0].progress}
              currentStep={mockSessions[0].currentStep}
              totalSteps={mockSessions[0].totalSteps}
              lastActivity={mockSessions[0].lastActivity}
              thumbnail={mockSessions[0].thumbnail}
              variant="large"
              onResume={() => console.log("Resume session")}
            />
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <SessionCard
              title={mockSessions[1].title}
              description={mockSessions[1].description}
              progress={mockSessions[1].progress}
              lastActivity={mockSessions[1].lastActivity}
              onResume={() => console.log("Continue session")}
            />
            <SessionCard
              title={mockSessions[2].title}
              description={mockSessions[2].description}
              progress={mockSessions[2].progress}
              lastActivity={mockSessions[2].lastActivity}
              onResume={() => console.log("Continue session")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SessionCard
            title={mockSessions[3].title}
            description={mockSessions[3].description}
            progress={mockSessions[3].progress}
            lastActivity={mockSessions[3].lastActivity}
            onResume={() => console.log("Continue session")}
          />
          {/* Start New Card */}
          <Card className="bg-card/50 border-border/50 border-dashed flex items-center justify-center min-h-[140px] hover:bg-card/80 transition-colors cursor-pointer group">
            <CardContent className="text-center py-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-muted-foreground group-hover:text-foreground">
                  Start New Project
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Achievements + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {mockAchievements.map((achievement) => (
              <AchievementItem
                key={achievement.id}
                icon={<Code className="h-5 w-5" />}
                title={achievement.title}
                description={achievement.description}
                xpReward={achievement.xpReward}
              />
            ))}
            {mockAchievements.map((achievement) => (
              <AchievementItem
                key={achievement.id + "_duplicate"}
                icon={<Trophy className="h-5 w-5" />}
                title="First Competition"
                description="Participated in local hackathon"
                xpReward={300}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recommended for you</CardTitle>
          </CardHeader>
          <CardContent className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3">
            <div className="text-muted-foreground text-center">
              <p>Advanced Robotics Logic</p>
              <div className="text-xs mt-1">based on your recent activity</div>
            </div>
            <Button variant="outline">Explore Course</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
