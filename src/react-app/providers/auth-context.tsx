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
import { authClient } from "@/lib/auth-client";

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  gender: "Male" | "Female";
  status: "FSTM" | "External";
  school: string | null;
  major: string | null;
  year: string | null;
  feesAmount: string;
  paymentStatus: "pending" | "paid";
  createdAt: number;
  updatedAt: number;
};

type AuthStatus = "loading" | "ready" | "error";

interface AuthContextValue {
  status: AuthStatus;
  session: ReturnType<typeof authClient.useSession>["data"];
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  needsProfile: boolean;
  refreshProfile: () => Promise<void>;
  signInEmail: typeof authClient.signIn.email;
  signInGoogle: typeof authClient.signIn.social;
  signUpEmail: typeof authClient.signUp.email;
  signOut: typeof authClient.signOut;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionState = authClient.useSession();
  const session = sessionState.data;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const userId = session?.user?.id ?? null;

  const runProfileFetch = useCallback(async () => {
    if (!userId) {
      abortRef.current?.abort();
      setProfile(null);
      setNeedsProfile(false);
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
      const response = await fetch("/api/profile", {
        signal: controller.signal,
      });

      if (response.status === 404) {
        setProfile(null);
        setNeedsProfile(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to load profile";
        throw new Error(errorMessage);
      }

      const data: Profile = await response.json();
      setProfile(data);
      setNeedsProfile(false);
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        return;
      }

      const errorObj = error as Error;
      setProfileError(errorObj);
      // When profile fetch fails, we can't verify if profile exists
      // Set needsProfile to true as a safe default to require onboarding
      setNeedsProfile(true);
      toast.error(errorObj.message || "Failed to load profile");
    } finally {
      if (!controller.signal.aborted) {
        setProfileLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    runProfileFetch();

    return () => {
      abortRef.current?.abort();
    };
  }, [runProfileFetch]);

  const refreshProfile = useCallback(async () => {
    await runProfileFetch();
  }, [runProfileFetch]);

  const signInEmail = useCallback<AuthContextValue["signInEmail"]>(
    (credentials, options) => authClient.signIn.email(credentials, options),
    [],
  );

  const signInGoogle = useCallback<AuthContextValue["signInGoogle"]>(
    (options) => authClient.signIn.social(options),
    [],
  );

  const signUpEmail = useCallback<AuthContextValue["signUpEmail"]>(
    (payload, options) => authClient.signUp.email(payload, options),
    [],
  );

  const signOut = useCallback<AuthContextValue["signOut"]>(async (...args) => {
    const result = await authClient.signOut(...args);
    abortRef.current?.abort();
    setProfile(null);
    setNeedsProfile(false);
    setProfileError(null);
    setProfileLoading(false);
    return result;
  }, []);

  const status: AuthStatus = useMemo(() => {
    if (sessionState.isPending || profileLoading) {
      return "loading";
    }

    if (profileError) {
      return "error";
    }

    return "ready";
  }, [sessionState.isPending, profileLoading, profileError]);

  const isAdmin = useMemo(() => {
    const role = session?.user?.role;
    return role === "admin";
  }, [session?.user?.role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      profile,
      isAuthenticated: Boolean(session?.user),
      isAdmin,
      needsProfile,
      refreshProfile,
      signInEmail,
      signInGoogle,
      signUpEmail,
      signOut,
    }),
    [
      status,
      session,
      profile,
      isAdmin,
      needsProfile,
      refreshProfile,
      signInEmail,
      signInGoogle,
      signUpEmail,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthContext };
