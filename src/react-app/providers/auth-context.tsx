import { useSession } from "./session-provider";
import { useProfile } from "./profile-provider";

type AuthStatus = "loading" | "ready" | "error";

export function useAuth() {
	const {
		session,
		isAuthenticated,
		isPending,
		signInEmail,
		signInGoogle,
		signUpEmail,
		signOut,
	} = useSession();

	const {
		profile,
		needsOnboarding,
		isAdmin,
		profileLoading,
		profileError,
		refreshProfile,
	} = useProfile();

	const status: AuthStatus =
		isPending || profileLoading
			? "loading"
			: profileError
				? "error"
				: "ready";

	return {
		status,
		session,
		profile,
		isAuthenticated,
		isAdmin,
		needsProfile: needsOnboarding,
		refreshProfile,
		signInEmail,
		signInGoogle,
		signUpEmail,
		signOut,
	};
}
