import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ParentDashboardPage from '../pages/parent/ParentDashboardPage';
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import CanteenDashboardPage from '../pages/canteen/CanteenDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/types';
import CredLanchePage from '../pages/parent/CredLanchePage';
import QRCodeScanPage from '../pages/canteen/QRCodeScanPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Placeholder pages
import ManageChildrenPage from '../pages/parent/ManageChildrenPage';
import ParentMenuPage from '../pages/parent/ParentMenuPage';
import ParentConsumptionPage from '../pages/parent/ParentConsumptionPage';
import StudentMenuPage from '../pages/student/StudentMenuPage';
import StudentConsumptionPage from '../pages/student/StudentConsumptionPage';
import StudentManagementPage from '../pages/canteen/StudentManagementPage';
import ProductManagementPage from '../pages/canteen/ProductManagementPage';
import ReportsPage from '../pages/canteen/ReportsPage';
import CanteenApprovalPage from '../pages/admin/CanteenApprovalPage';
import CanteenRegistrationPage from '../pages/canteen/CanteenRegistrationPage';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role && allowedRoles.includes(profile.role)) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AuthLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes with auth layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Public routes with full layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          {/* Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.PARENT]} />}>
            <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
            <Route path="/parent/credlanche" element={<CredLanchePage />} />
            <Route path="/parent/manage-children" element={<ManageChildrenPage />} />
            <Route path="/parent/menu" element={<ParentMenuPage />} />
            <Route path="/parent/consumption/:childId" element={<ParentConsumptionPage />} />
            <Route path="/parent/consumption" element={<ParentConsumptionPage />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/menu" element={<StudentMenuPage />} />
            <Route path="/student/consumption" element={<StudentConsumptionPage />} />
          </Route>

          {/* Canteen Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.CANTEEN]} />}>
            <Route path="/canteen/dashboard" element={<CanteenDashboardPage />} />
            <Route path="/canteen/register" element={<CanteenRegistrationPage />} />
            <Route path="/canteen/scan" element={<QRCodeScanPage />} />
            <Route path="/canteen/students" element={<StudentManagementPage />} />
            <Route path="/canteen/products" element={<ProductManagementPage />} />
            <Route path="/canteen/reports" element={<ReportsPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
             <Route path="/admin/canteens" element={<CanteenApprovalPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
    