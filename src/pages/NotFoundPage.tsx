import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-100">
      <img src="https://picsum.photos/seed/404error/300/200" alt="Lost signal" className="w-64 h-auto mb-8 rounded-lg shadow-lg" />
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Página Não Encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Oops! Parece que a página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">Voltar para a Página Inicial</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
    