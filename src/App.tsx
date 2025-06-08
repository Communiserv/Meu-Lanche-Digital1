import React from 'react';
import AppRoutes from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <div className="floating-shape" />
      <div className="floating-shape" />
      <div className="floating-shape" />
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
    </div>
  );
};

export default App;
    