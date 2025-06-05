
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Meu Lanche Digital. Todos os direitos reservados.</p>
        <p className="text-sm text-gray-400 mt-1">Simplificando a vida escolar.</p>
      </div>
    </footer>
  );
};

export default Footer;
    