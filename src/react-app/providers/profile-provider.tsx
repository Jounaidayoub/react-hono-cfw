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
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState<Error | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const runProfileFetch = useCallback(async () => {
		if (!userId) {
			setProfile(null);
			setProfileError(null);
			setProfileLoading(false);
			return;
		}

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setProfileLoading(true);
		setProfileError(null);

		try {
			const data = await profileApi.get();
			if (controller.signal.aborted) return;
			setProfile(data);
		} catch (error) {
			if ((error as DOMException).name === "AbortError") return;
			if (controller.signal.aborted) return;

			if (isGetProfileApiError(error)) {
				switch (error.type) {
					case "PROFILE_NOT_FOUND":
						setProfile(null);
						return;
					default: {
						const exhaustiveError: never = error.type;
						return exhaustiveError;
					}
				}
			}

			// Network / unexpected error
			const errorObj = error as Error;
			setProfileError(errorObj);
			toast.error(errorObj.message || "Failed to load profile");
		} finally {
			if (!controller.signal.aborted) {
				setProfileLoading(false);
			}
		}
	}, [userId]);

	useEffect(() => {
		if (!userId) {
			setProfile(null);
			setProfileError(null);
			setProfileLoading(false);
			return;
		}

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
			setProfileError(null);
		}
	}, [isAuthenticated]);

	const refreshProfile = useCallback(async () => {
		await runProfileFetch();
	}, [runProfileFetch]);

	const value = useMemo<ProfileContextValue>(
		() => ({
			profile,
			profileLoading,
			profileError,
			refreshProfile,
		}),
		[
			profile,
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
