import { Route, Routes } from "react-router";
import { AuthGate } from "@/components/auth-gate";
import { AuthProvider } from "@/providers/auth-context";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Signup from "@/pages/Signup";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGate requireProfile={false}>
              <Home />
            </AuthGate>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGate requireProfile={false}>
              <Login />
            </AuthGate>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthGate requireProfile={false}>
              <Signup />
            </AuthGate>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthGate requireProfile={false}>
              <Onboarding />
            </AuthGate>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGate>
              <Profile />
            </AuthGate>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
