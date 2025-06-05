import React from 'react';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { UserRole } from '@/types/types';

const CanteenApprovalPage: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user || !profile || profile.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Acesso Negado">
          <p className="text-red-600">
            Você não tem permissão para acessar esta página. Apenas administradores podem acessar esta área.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Cantinas (Admin)</h1>
      <Card title="Aprovação e Gerenciamento de Cantinas da Plataforma">
        <p className="text-gray-600">
          Funcionalidade em desenvolvimento. Esta área é reservada para administradores da plataforma "Meu Lanche Digital" para aprovar novos cadastros de cantinas e gerenciar cantinas existentes.
        </p>
        <img src="https://picsum.photos/seed/canteenapproval/600/300" alt="Em construção" className="mt-4 rounded-lg shadow-md w-full object-cover h-64"/>
      </Card>
    </div>
  );
};

export default CanteenApprovalPage;
    