import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LiveVitals from "./pages/LiveVitals";
import AIBots from "./pages/AIBots";
import PatientDetails from "./pages/PatientDetails";
import PatientProfile from "./pages/PatientProfile";
import MotherDashboard from "./pages/MotherDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedPatientDetailsRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDoctor, isAsha } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isDoctor || isAsha) return <>{children}</>;
  return <Navigate to="/role-select" replace />;
}

/** Mother dashboard: only mothers can access; others redirect to role-select or login. */
function ProtectedMotherDashboardRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isMother } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isMother) return <Navigate to="/role-select" replace />;
  return <>{children}</>;
}

/** ASHA only: redirect to patient list if ASHA tries to open Live Vitals. Doctor unchanged. */
function LiveVitalsRoute({ children }: { children: React.ReactNode }) {
  const { isAsha } = useAuth();
  if (isAsha) return <Navigate to="/patient-details" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/mother-dashboard"
                element={
                  <ProtectedMotherDashboardRoute>
                    <MotherDashboard />
                  </ProtectedMotherDashboardRoute>
                }
              />
              <Route path="/live-vitals" element={<LiveVitalsRoute><LiveVitals /></LiveVitalsRoute>} />
              <Route path="/ai-bots" element={<AIBots />} />
              <Route
                path="/patient/:id"
                element={
                  <ProtectedPatientDetailsRoute>
                    <PatientProfile />
                  </ProtectedPatientDetailsRoute>
                }
              />
              <Route
                path="/patient-details"
                element={
                  <ProtectedPatientDetailsRoute>
                    <PatientDetails />
                  </ProtectedPatientDetailsRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
