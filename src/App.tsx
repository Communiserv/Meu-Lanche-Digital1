import React from 'react';
import AppRoutes from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';

const App: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <div className="floating-shape" />
      <div className="floating-shape" />
      <div className="floating-shape" />
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </div>
  );
};

export default App;
    