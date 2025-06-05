
import React from 'react';
import Card from '../../components/ui/Card';

const ManageChildrenPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Filhos</h1>
      <Card title="Cadastro e Vinculação de Filhos">
        <p className="text-gray-600">
          Funcionalidade em desenvolvimento. Aqui você poderá cadastrar novos filhos ou vincular contas de alunos existentes à sua conta de responsável.
        </p>
        <img src="https://picsum.photos/seed/managechildren/600/300" alt="Em construção" className="mt-4 rounded-lg shadow-md w-full object-cover h-64"/>
      </Card>
    </div>
  );
};

export default ManageChildrenPage;
    