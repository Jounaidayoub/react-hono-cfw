import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { toast } from "sonner";
import { isGetProfileApiError, profileApi } from "@/api/profile";
import { useSession } from "./session-provider";
import type { UserProfile } from "@/lib/schemas/index";

interface ProfileContextValue {
	profile: UserProfile | null;
	needsOnboarding: boolean;
	isAdmin: boolean;
	profileLoading: boolean;
	profileError: Error | null;
	refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
	undefined,
);

interface ProfileProviderProps {
	children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
	const { session, isAuthenticated } = useSession();
	const userId = session?.user?.id ?? null;

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [needsOnboarding, setNeedsOnboarding] = useState(false);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState<Error | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	// Synchronous state adjustment during render — eliminates the
	// one-render gap between session resolving and profile fetch starting.
	const [prevUserId, setPrevUserId] = useState<string | null>(null);
	if (prevUserId !== userId) {
		setPrevUserId(userId);
		if (userId) {
			setProfileLoading(true);
		} else {
			// Logged out — clear everything synchronously
			setProfile(null);
			setNeedsOnboarding(false);
			setProfileError(null);
			setProfileLoading(false);
		}
	}

	const runProfileFetch = useCallback(async () => {
		if (!userId) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setProfileError(null);

		try {
			const data = await profileApi.get();
			if (controller.signal.aborted) return;
			setProfile(data);
			setNeedsOnboarding(false);
		} catch (error) {
			if ((error as DOMException).name === "AbortError") return;
			if (controller.signal.aborted) return;

			if (isGetProfileApiError(error)) {
				switch (error.type) {
					case "PROFILE_NOT_FOUND":
						setProfile(null);
						setNeedsOnboarding(true);
						return;
					default: {
						const exhaustiveError: never = error.type;
						return exhaustiveError;
					}
				}
			}

			// Network / unexpected error — do NOT treat as needsOnboarding
			const errorObj = error as Error;
			setProfileError(errorObj);
			setNeedsOnboarding(false);
			toast.error(errorObj.message || "Failed to load profile");
		} finally {
			if (!controller.signal.aborted) {
				setProfileLoading(false);
			}
		}
	}, [userId]);

	useEffect(() => {
		if (!userId) return;
		runProfileFetch();

		return () => {
			abortRef.current?.abort();
		};
	}, [runProfileFetch, userId]);

	// Clear state when user logs out
	useEffect(() => {
		if (!isAuthenticated) {
			abortRef.current?.abort();
			setProfile(null);
			setNeedsOnboarding(false);
			setProfileError(null);
		}
	}, [isAuthenticated]);

	const refreshProfile = useCallback(async () => {
		await runProfileFetch();
	}, [runProfileFetch]);

	const isAdmin = useMemo(() => {
		return session?.user?.role === "admin";
	}, [session?.user?.role]);

	const value = useMemo<ProfileContextValue>(
		() => ({
			profile,
			needsOnboarding,
			isAdmin,
			profileLoading,
			profileError,
			refreshProfile,
		}),
		[
			profile,
			needsOnboarding,
			isAdmin,
			profileLoading,
			profileError,
			refreshProfile,
		],
	);

	return (
		<ProfileContext.Provider value={value}>
			{children}
		</ProfileContext.Provider>
	);
}

export function useProfile() {
	const context = useContext(ProfileContext);

	if (!context) {
		throw new Error("useProfile must be used within a ProfileProvider");
	}

	return context;
}
