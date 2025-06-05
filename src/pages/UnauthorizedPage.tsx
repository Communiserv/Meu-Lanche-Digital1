import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@components/ui/Button';
import { useAuth } from '@contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user) {
      // Navigate to a default dashboard based on role if available
      if (user.role === 'parent') navigate('/parent/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'canteen') navigate('/canteen/dashboard');
      else navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-red-50">
      <img src="https://picsum.photos/seed/accessdenied/300/200" alt="Access Denied" className="w-64 h-auto mb-8 rounded-lg shadow-lg" />
      <h1 className="text-5xl font-bold text-red-600 mb-4">Acesso Negado!</h1>
      <p className="text-gray-700 text-xl mb-8 max-w-md">
        Você não tem permissão para acessar esta página.
      </p>
      <div className="space-x-4">
        <Button onClick={handleGoBack} variant="danger" size="lg">
          Voltar
        </Button>
        <Link to="/">
          <Button variant="ghost" size="lg">Página Inicial</Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
    