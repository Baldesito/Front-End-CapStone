import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../config/api";

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
