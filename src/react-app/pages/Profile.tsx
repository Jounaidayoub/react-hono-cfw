import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth, type Profile as ProfileData } from "@/providers/auth-context";

export default function Profile() {
  const navigate = useNavigate();
  const { status, session, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (status === "loading" && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={() => navigate("/onboarding")} className="mt-4">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProfileDetails
      profile={profile}
      sessionEmail={session?.user.email}
      sessionImage={session?.user.image}
      onEditProfile={() => navigate("/onboarding")}
      onSignOut={handleSignOut}
    />
  );
}

interface ProfileDetailsProps {
  profile: ProfileData;
  sessionEmail?: string | null;
  sessionImage?: string | null;
  onEditProfile: () => void;
  onSignOut: () => Promise<void>;
}

function ProfileDetails({ profile, sessionEmail, sessionImage, onEditProfile, onSignOut }: ProfileDetailsProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen  p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={sessionImage || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <CardTitle className="text-2xl">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <CardDescription className="text-base">{sessionEmail}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <Badge variant="secondary">{profile.status}</Badge>
                <Badge
                  className={
                    profile.paymentStatus === "paid"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }
                >
                  {profile.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileField label="First Name" value={profile.firstName} />
              <ProfileField label="Last Name" value={profile.lastName} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileField label="Phone Number" value={profile.phoneNumber} />
              <ProfileField label="Date of Birth" value={profile.birthDate} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileField label="Gender" value={profile.gender} />
              <ProfileField label="Status" value={profile.status} />
            </div>
            {profile.status === "External" && profile.school && (
              <>
                <Separator />
                <ProfileField label="School/University" value={profile.school} />
              </>
            )}
            {(profile.major || profile.year) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.major && <ProfileField label="Major/Branch" value={profile.major} />}
                  {profile.year && <ProfileField label="Year" value={profile.year} />}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Registration Fee</p>
                <p className="text-2xl font-bold">{profile.feesAmount}</p>
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  profile.paymentStatus === "paid"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-destructive text-white hover:bg-destructive/90"
                }`}
              >
                {profile.paymentStatus === "paid" ? "✓ Paid" : "Not Paid"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
          <Button variant="outline" className="flex-1" onClick={onEditProfile}>
            Edit Profile
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
