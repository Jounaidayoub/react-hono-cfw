import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { User } from "@/types/user";
import { useEffect, useState } from "react";

interface UserDetailsDrawerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdate: (userId: string, newRole: "user" | "admin") => Promise<void>;
}

export function UserDetailsDrawer({
  user,
  open,
  onOpenChange,
  onRoleUpdate,
}: UserDetailsDrawerProps) {
  const isMobile = useIsMobile();
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

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
        </div>

        <DrawerFooter className="border-t pt-4">
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
