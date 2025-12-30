import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/login-form";

function App() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
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
      callbackURL: window.location.origin,
    });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {session ? (
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold">
              Welcome, {session.user.name}!
            </h1>
            <p className="text-muted-foreground">{session.user.email}</p>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <LoginForm
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSignIn={signIn}
            onGoogleSignIn={signInWithGoogle}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
