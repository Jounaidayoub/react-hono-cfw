import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "@/providers/session-provider";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
	children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
	const { session, isPending, isAuthenticated } = useSession();
	const needsOnboarding = session?.user?.needsOnboarding ?? false;
	const location = useLocation();

	const pathname = location.pathname;
	const isAuthRoute = pathname === "/login" || pathname === "/signup";
	const isOnboardingRoute = pathname === "/onboarding";

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!isAuthenticated && !isAuthRoute) {
		return <Navigate to={`/login?returnTo=${encodeURIComponent(pathname + location.search)}`} replace />;
	}

	if (isAuthenticated) {
		if (needsOnboarding && !isOnboardingRoute) {
			return <Navigate to="/onboarding" replace />;
		}

		if (!needsOnboarding && (isOnboardingRoute || isAuthRoute)) {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return <>{children}</>;
}
