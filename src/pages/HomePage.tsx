import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { UserRole } from '@/types/types';

const HomePage: React.FC = () => {
  const { user, profile, loading } = useAuth();

  const getDashboardPath = () => {
    if (!user || !profile) return "/login";
    switch (profile.role) {
      case UserRole.PARENT: return "/parent/dashboard";
      case UserRole.STUDENT: return "/student/dashboard";
      case UserRole.CANTEEN: return "/canteen/dashboard";
      default: return "/login";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white p-6">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Bem-vindo ao Meu Lanche Digital!</h1>
        <p className="text-xl text-primary-light drop-shadow-md">A solução inteligente para a alimentação escolar.</p>
      </header>

      <main className="w-full max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/90 backdrop-blur-sm text-gray-800 hover:shadow-primary-light/50 transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-primary mb-3">Para Pais</h2>
            <p className="text-gray-600">Adicione créditos, defina limites e acompanhe o consumo dos seus filhos com facilidade e segurança.</p>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm text-gray-800 hover:shadow-primary-light/50 transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-primary mb-3">Para Alunos</h2>
            <p className="text-gray-600">Use seu QR Code para comprar lanches, consulte seu saldo e veja o cardápio da cantina.</p>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm text-gray-800 hover:shadow-primary-light/50 transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-primary mb-3">Para Cantinas</h2>
            <p className="text-gray-600">Gerencie produtos, processe pagamentos rapidamente com QR Code e acesse relatórios detalhados.</p>
          </Card>
        </div>

        <div className="text-center">
          {loading ? (
            <p className="text-lg">Carregando sua experiência...</p>
          ) : user && profile ? (
            <Link to={getDashboardPath()}>
              <Button size="lg" variant="secondary">Acessar Meu Painel</Button>
            </Link>
          ) : (
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-[#fbbc05] text-white hover:bg-[#f9a825]">
                  Comece Agora
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 text-center text-primary-light text-sm">
        <p>&copy; {new Date().getFullYear()} Meu Lanche Digital. Transformando a experiência escolar.</p>
      </footer>
    </div>
  );
};

export default HomePage;
    