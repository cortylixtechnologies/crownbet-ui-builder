import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
};
