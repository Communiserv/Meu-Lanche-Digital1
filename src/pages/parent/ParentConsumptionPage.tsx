
import React from 'react';
import Card from '../../components/ui/Card';
import { useParams } from 'react-router-dom';


const ParentConsumptionPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Histórico de Consumo {childId ? `(Filho ID: ${childId})`: ''}</h1>
      <Card title="Detalhes do Consumo">
        <p className="text-gray-600">
          Funcionalidade em desenvolvimento. Aqui você poderá ver o histórico detalhado de compras e consumo dos seus filhos.
        </p>
        <img src="https://picsum.photos/seed/parentconsumption/600/300" alt="Em construção" className="mt-4 rounded-lg shadow-md w-full object-cover h-64"/>
      </Card>
    </div>
  );
};

export default ParentConsumptionPage;
    