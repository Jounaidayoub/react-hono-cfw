import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/providers/auth-context";

export default function Home() {
  const navigate = useNavigate();
  const { status, isAuthenticated, needsProfile } = useAuth();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (needsProfile) {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate("/profile", { replace: true });
  }, [isAuthenticated, needsProfile, navigate, status]);

  return null;
}
