import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { AuthGate } from "@/components/auth-gate";
import { AuthProvider } from "@/providers/auth-context";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ThemeProvider } from "@/providers/theme-provider";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";

function App() {
  return (
    <ThemeProvider storageKey="xplore-ui-theme" defaultTheme="dark">
      <AuthProvider>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public/Auth Routes */}
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

          {/* Dashboard Layout Routes */}
          <Route
            element={
              <AuthGate>
                <DashboardLayout />
              </AuthGate>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
