import { useState } from "react";
import { useNavigate } from "react-router";
import { SignupForm } from "@/components/signup-form";
import { useAuth } from "@/providers/auth-context";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUpEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (password !== confirmPassword) {
      setIsLoading(false);
      alert("Passwords do not match");
      return;
    }

    await signUpEmail(
      { email, password, name },
      {
        onSuccess: () => {
          setIsLoading(false);
          navigate("/onboarding", { replace: true });
        },
        onError: ({ error }) => {
          setIsLoading(false);
          alert(error.message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm
          onSubmit={handleSubmit}
          onNavigateLogin={() => navigate("/login")}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
