import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SkillTest from "./pages/SkillTest";
import Resources from "./pages/Resources";
import CVBuilder from "./pages/CVBuilder";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import AdminRedirect from "./pages/AdminRedirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/careers" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/test" element={<SkillTest />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/cv" element={<CVBuilder />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/admin/*" element={<AdminRedirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
