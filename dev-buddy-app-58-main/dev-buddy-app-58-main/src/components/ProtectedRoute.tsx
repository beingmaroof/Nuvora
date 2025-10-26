import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user hasn't completed onboarding and they're not already on the onboarding page, redirect to onboarding
  if (
    profile && 
    profile.onboarding_completed === false && 
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has completed onboarding but is trying to access the onboarding page, redirect to home
  if (
    profile && 
    profile.onboarding_completed === true && 
    location.pathname === "/onboarding"
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};