import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  adminApi,
  isGetAdminUserProfileApiError,
  isUpdatePaymentStatusApiError,
  type GetAdminUserProfileApiError,
  type UpdatePaymentStatusApiError,
} from "@/api/admin";
import { authClient } from "@/lib/auth-client";
import type { AppRole, AppUserWithRole } from "@/hooks/use-users";
import type { UserProfile } from "@/lib/schemas/index";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


interface UserDetailsDrawerProps {
  user: AppUserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdate: (userId: string, newRole: AppRole) => Promise<void>;
  onUserDeleted?: () => void;
}

function getAdminUserProfileErrorMessage(
  error: GetAdminUserProfileApiError,
): string {
  switch (error.type) {
    case "ADMIN_PROFILE_NOT_FOUND":
      return "This user has not completed onboarding yet.";
    default: {
      const exhaustiveError: never = error.type;
      return exhaustiveError;
    }
  }
}

function getUpdatePaymentStatusErrorMessage(
  error: UpdatePaymentStatusApiError,
): string {
  switch (error.type) {
    case "VALIDATION_ERROR":
      return "Invalid payment status.";
    case "ADMIN_PROFILE_NOT_FOUND":
      return "This user has not completed onboarding yet.";
    case "ADMIN_PAYMENT_STATUS_UPDATE_FAILED":
      return "Failed to update payment status.";
    default: {
      const exhaustiveError: never = error.type;
      return exhaustiveError;
    }
  }
}

export function UserDetailsDrawer({
  user,
  open,
  onOpenChange,
  onRoleUpdate,
  onUserDeleted,
}: UserDetailsDrawerProps) {
  const isMobile = useIsMobile();
  const [selectedRole, setSelectedRole] = useState<AppRole>(
    "user"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        setSelectedRole(user.role ?? "user");
    }
  }, [user]);

  useEffect(() => {
    if (user && open) {
      setIsLoadingProfile(true);
      setProfileErrorMessage(null);
      adminApi
        .getUserProfile(user.id)
        .then(setProfile)
        .catch((error) => {
          console.error("Failed to fetch profile:", error);

          if (isGetAdminUserProfileApiError(error)) {
            setProfileErrorMessage(getAdminUserProfileErrorMessage(error));
            return;
          }

          setProfileErrorMessage("Failed to fetch profile.");
        })
        .finally(() => setIsLoadingProfile(false));
    } else {
      setProfile(null);
      setProfileErrorMessage(null);
    }
  }, [user, open]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentChange = async (checked: boolean) => {
    if (!user) return;
    const status = checked ? "paid" : "pending";
    try {
      const updated = await adminApi.updatePaymentStatus(user.id, status);
      setProfile(updated);
      setProfileErrorMessage(null);
      toast.success(`User marked as ${status}`);
    } catch (error) {
      if (isUpdatePaymentStatusApiError(error)) {
        toast.error(getUpdatePaymentStatusErrorMessage(error));
        return;
      }

      toast.error("Error updating payment status");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      const res = await authClient.admin.removeUser({ userId: user.id });
      if (res.error) {
        toast.error(res.error.message || "Failed to delete user");
      } else {
        toast.success("User deleted successfully");
        setDeleteDialogOpen(false);
        onOpenChange(false);
        onUserDeleted?.();
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent
        className={
          isMobile
            ? "h-[80vh] w-full"
            : "h-full w-full sm:max-w-[400px] ml-auto"
        }
      >
        <DrawerHeader>
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle className="text-xl">{user.name}</DrawerTitle>
              <DrawerDescription>{user.email}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-col gap-6 px-4 py-4 overflow-y-auto">
          {/* Role Selection */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="role" className="text-sm font-semibold">
              User Role
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as "user" | "admin")
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Joined
              </Label>
              <p className="text-sm font-medium mt-1">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Last Sync
              </Label>
              <p className="text-sm font-medium mt-1">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Account Status
            </Label>
            <div className="mt-2">
              <Badge
                variant={user.banned ? "destructive" : "secondary"}
                className="px-3 py-1"
              >
                {user.banned ? "Banned" : "Active"}
              </Badge>
            </div>
          </div>

          {user.banned && user.banReason && (
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <Label className="text-xs text-destructive font-semibold">
                Ban Reason
              </Label>
              <p className="text-sm mt-1">{user.banReason}</p>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Security
            </Label>
            <div className="mt-2">
              <Badge
                variant={user.emailVerified ? "outline" : "outline"}
                className={
                  user.emailVerified
                    ? "text-green-500 border-green-500/20 bg-green-500/5"
                    : "text-yellow-500 border-yellow-500/20 bg-yellow-500/5"
                }
              >
                {user.emailVerified ? "Email Verified" : "Email Not Verified"}
              </Badge>
            </div>
          </div>

          {/* Payment Status Section */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Payment Status
            </Label>
            <div className="mt-3 flex items-center space-x-2">
              {isLoadingProfile ? (
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              ) : profile ? (
                <>
                  <Checkbox
                    id="payment-status"
                    checked={profile.paymentStatus === "paid"}
                    onCheckedChange={handlePaymentChange}
                  />
                  <label
                    htmlFor="payment-status"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {profile.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending Payment"}
                  </label>
                </>
              ) : profileErrorMessage ? (
                <span className="text-sm text-muted-foreground">
                  {profileErrorMessage}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No profile data available
                </span>
              )}
            </div>
            {profile && profile.feesAmount && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Fee: {profile.feesAmount}
              </p>
            )}
          </div>

        </div>

        <DrawerFooter className="border-t pt-4 gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete User
          </Button>
        </DrawerFooter>
      </DrawerContent>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user?.name}? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
