import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import CenteredPage from "../components/CenteredPage";
import Spinner from "../components/Spinner";

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <CenteredPage className="gap-6 text-center">
        <Spinner className="size-16 border-8 border-white/25 border-t-white" />
        <p role="status" className="text-2xl font-semibold">
          Loading...
        </p>
      </CenteredPage>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
