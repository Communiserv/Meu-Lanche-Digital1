
import React from 'react';
import Card from '../../components/ui/Card';

const ParentMenuPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cardápio da Cantina</h1>
      <Card title="Visualização do Cardápio">
        <p className="text-gray-600">
          Funcionalidade em desenvolvimento. Aqui você poderá visualizar o cardápio completo da cantina frequentada pelos seus filhos.
        </p>
        <img src="https://picsum.photos/seed/parentmenu/600/300" alt="Em construção" className="mt-4 rounded-lg shadow-md w-full object-cover h-64"/>
      </Card>
    </div>
  );
};

export default ParentMenuPage;
    