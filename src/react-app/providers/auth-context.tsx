import { useSession } from "./session-provider";

type AuthStatus = "loading" | "ready";

export function useAuth() {
	const {
		session,
		isAuthenticated,
		isPending,
		signInEmail,
		signInGoogle,
		signUpEmail,
		signOut,
		refreshSession,
	} = useSession();

	const status: AuthStatus = isPending ? "loading" : "ready";
	const isAdmin = session?.user?.role === "admin";
	const needsOnboarding = session?.user?.needsOnboarding ?? false;

	return {
		status,
		session,
		isAuthenticated,
		isAdmin,
		needsOnboarding,
		refreshSession,
		signInEmail,
		signInGoogle,
		signUpEmail,
		signOut,
	};
}
