import {
	createContext,
	useContext,
	useMemo,
	type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";

type SessionData = ReturnType<typeof authClient.useSession>["data"];

interface SessionContextValue {
	session: SessionData;
	isAuthenticated: boolean;
	isPending: boolean;
	signInEmail: typeof authClient.signIn.email;
	signInGoogle: typeof authClient.signIn.social;
	signUpEmail: typeof authClient.signUp.email;
	signOut: typeof authClient.signOut;
	refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
	undefined,
);

interface SessionProviderProps {
	children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
	const sessionState = authClient.useSession();
	const session = sessionState.data;
	const value = useMemo<SessionContextValue>(
		() => ({
			session,
			isAuthenticated: Boolean(session?.user),
			isPending: sessionState.isPending,
			signInEmail: authClient.signIn.email,
			signInGoogle: authClient.signIn.social,
			signUpEmail: authClient.signUp.email,
			signOut: authClient.signOut,
			refreshSession: sessionState.refetch,
		}),
		[session, sessionState.isPending, sessionState.refetch],
	);

	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);

	if (!context) {
		throw new Error("useSession must be used within a SessionProvider");
	}

	return context;
}
