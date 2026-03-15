import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { AuthGate } from "@/components/auth-gate";
import { ProfileProvider } from "@/providers/profile-provider";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import DashboardLayout from "@/layouts/DashboardLayout";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import Admin from "@/pages/Admin";
import AdminEvents from "@/pages/AdminEvents";
import CheckinRoute from "@/pages/CheckinRoute";

function App() {
  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public/Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthGate>
              <Login />
            </AuthGate>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthGate>
              <Signup />
            </AuthGate>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthGate>
              <Onboarding />
            </AuthGate>
          }
        />

        {/* Dashboard Layout Routes */}
        <Route
          element={
            <AuthGate>
              <ProfileProvider>
                <DashboardLayout />
              </ProfileProvider>
            </AuthGate>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/dashboard/checkin/:eventId" element={<CheckinRoute />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
