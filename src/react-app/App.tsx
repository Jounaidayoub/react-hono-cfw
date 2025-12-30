import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/login-form";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";

// Auth wrapper that checks for profile
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (session && !profileChecked) {
      fetch("/api/profile")
        .then((res) => {
          if (res.status === 404) {
            setHasProfile(false);
          } else if (res.ok) {
            setHasProfile(true);
          }
          setProfileChecked(true);
        })
        .catch(() => {
          setProfileChecked(true);
        });
    }
  }, [session, profileChecked]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // Still checking profile
  if (!profileChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <p>Checking profile...</p>
      </div>
    );
  }

  // Redirect to onboarding if no profile (unless already on onboarding page)
  if (!hasProfile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect away from onboarding if already has profile
  if (hasProfile && location.pathname === "/onboarding") {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

// Login page with redirect for authenticated users
function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => setIsLoading(false),
        onError: (ctx) => {
          setIsLoading(false);
          alert(ctx.error.message);
        },
      }
    );
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin + "/profile",
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSignIn={signIn}
          onGoogleSignIn={signInWithGoogle}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
