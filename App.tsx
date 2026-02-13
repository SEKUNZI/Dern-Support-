import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import KnowledgeBase from "./pages/KnowledgeBase";
import CustomerLayout from "./components/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SubmitRequest from "./pages/customer/SubmitRequest";
import Appointments from "./pages/customer/Appointments";
import StaffLayout from "./components/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Jobs from "./pages/staff/Jobs";
import JobDetail from "./pages/staff/JobDetail";
import Inventory from "./pages/staff/Inventory";
import Analytics from "./pages/staff/Analytics";
import StaffKnowledgeBase from "./pages/staff/StaffKnowledgeBase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <Auth />;
  if (role === "staff" || role === "admin") return <Navigate to="/staff" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />

            {/* Customer routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
              <Route index element={<CustomerDashboard />} />
              <Route path="submit-request" element={<SubmitRequest />} />
              <Route path="appointments" element={<Appointments />} />
            </Route>

            {/* Staff routes */}
            <Route path="/staff" element={<ProtectedRoute allowedRoles={["staff", "admin"]}><StaffLayout /></ProtectedRoute>}>
              <Route index element={<StaffDashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="knowledge-base" element={<StaffKnowledgeBase />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
