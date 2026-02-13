import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Since we check localStorage in slice initialization, we might not assume loading true initially
  // But for async checks (if we had them), we would.
  // The current auth slice initialization is synchronous for localStorage.
  // However, if we want to simulate an initial check (like verify token API), we might need an effect.
  // For now, based on the previous implementation:
  
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
