import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/providers/auth-context";

interface AuthGateProps {
  requireProfile?: boolean;
  children: ReactNode;
}

const FULL_SCREEN_WRAPPER = "flex min-h-screen items-center justify-center bg-muted";

export function AuthGate({ requireProfile = true, children }: AuthGateProps) {
  const { status, isAuthenticated, needsProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isOnboardingRoute = pathname === "/onboarding";

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isAuthenticated && !isAuthRoute) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAuthenticated && needsProfile && !isOnboardingRoute) {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (isAuthenticated && !needsProfile) {
      if (isOnboardingRoute) {
        navigate("/profile", { replace: true });
        return;
      }

      if (!requireProfile && isAuthRoute) {
        navigate("/profile", { replace: true });
      }
    }
  }, [
    isAuthenticated,
    isAuthRoute,
    isOnboardingRoute,
    navigate,
    needsProfile,
    requireProfile,
    status,
  ]);

  if (status === "loading") {
    return (
      <div className={FULL_SCREEN_WRAPPER}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isAuthRoute) {
      return <>{children}</>;
    }

    return null;
  }

  if (needsProfile && !isOnboardingRoute) {
    return null;
  }

  if (!needsProfile) {
    if (isOnboardingRoute) {
      return null;
    }

    if (!requireProfile && isAuthRoute) {
      return null;
    }
  }

  return <>{children}</>;
}
