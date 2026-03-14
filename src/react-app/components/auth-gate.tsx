import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "@/providers/session-provider";
import { useProfile } from "@/providers/profile-provider";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthGateProps {
	requireProfile?: boolean;
	children: ReactNode;
}

function getRedirectTarget(opts: {
	isAuthenticated: boolean;
	needsOnboarding: boolean;
	requireProfile: boolean;
	isAuthRoute: boolean;
	isOnboardingRoute: boolean;
	returnTo: string;
}): string | null {
	const {
		isAuthenticated,
		needsOnboarding,
		requireProfile,
		isAuthRoute,
		isOnboardingRoute,
		returnTo,
	} = opts;

	if (!isAuthenticated && !isAuthRoute) {
		return `/login?returnTo=${encodeURIComponent(returnTo)}`;
	}

	if (isAuthenticated && needsOnboarding && !isOnboardingRoute) {
		return "/onboarding";
	}

	if (isAuthenticated && !needsOnboarding && isOnboardingRoute) {
		return "/dashboard";
	}

	if (isAuthenticated && !needsOnboarding && !requireProfile && isAuthRoute) {
		return "/dashboard";
	}

	return null;
}

export function AuthGate({
	requireProfile = true,
	children,
}: AuthGateProps) {
	const { isPending, isAuthenticated } = useSession();
	const { needsOnboarding, profileLoading, profileError, refreshProfile } =
		useProfile();
	const location = useLocation();

	const pathname = location.pathname;
	const isAuthRoute = pathname === "/login" || pathname === "/signup";
	const isOnboardingRoute = pathname === "/onboarding";

	// Still loading session or profile
	if (isPending || profileLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Profile fetch failed (network error, not 404) — show retry
	if (isAuthenticated && profileError && !isAuthRoute) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted">
				<p className="text-sm text-muted-foreground">
					Failed to load your profile.
				</p>
				<Button variant="outline" onClick={() => refreshProfile()}>
					Try Again
				</Button>
			</div>
		);
	}

	// Compute redirect if needed
	const redirectTo = getRedirectTarget({
		isAuthenticated,
		needsOnboarding,
		requireProfile,
		isAuthRoute,
		isOnboardingRoute,
		returnTo: pathname + location.search,
	});

	if (redirectTo) {
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
}
