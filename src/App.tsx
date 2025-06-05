import React from 'react';
import AppRoutes from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
    