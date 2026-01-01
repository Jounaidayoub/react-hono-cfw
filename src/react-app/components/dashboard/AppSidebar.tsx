import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  User,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/certificates", label: "Certificates", icon: Award },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            X
          </div>
          <span className="font-bold text-lg">XPLORE</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                isActive={location.pathname === item.to}
                onClick={() => navigate(item.to)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t gap-4">
        {/* Daily Goal Widget */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span>Daily Goal</span>
            <span className="text-primary font-medium">85%</span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[85%] rounded-full" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
