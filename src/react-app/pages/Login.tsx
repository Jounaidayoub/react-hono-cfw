import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/providers/auth-context";

export default function Login() {
  const { status, isAuthenticated, signInEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    await signInEmail(
      { email, password },
      {
        onSuccess: () => setIsLoading(false),
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message);
        },
      }
    );
  };

  const signInWithGoogle = async () => {
    //TODO: handle errors and there is problem where
    // of the browser history stack : after signitn in successfully the user will land on the 
    // the callback url spicified but if he clikcs back he will land the on the oauht prider page 
    // whihc not only bad ux , but also shows sometimes a btter-auth error
    await signInGoogle({
      provider: "google",
      callbackURL: `/profile`,
      
    });
  };

  if (status === "loading" || isAuthenticated) {
    return null;
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
          onNavigateSignup={() => navigate("/signup")}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
