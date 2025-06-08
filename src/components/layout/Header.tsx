import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/types';
import Button from '@components/ui/Button';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavLinks = () => {
    if (!user || !profile) {
      return [
        { to: '/login', label: 'Entrar', icon: '🔑' },
        { to: '/register', label: 'Registrar', icon: '📝' },
      ];
    }

    switch (profile.role) {
      case UserRole.PARENT:
        return [
          { to: '/parent/dashboard', label: 'Dashboard', icon: '📊' },
          { to: '/parent/credlanche', label: 'CredLanche', icon: '💳' },
          { to: '/parent/manage-children', label: 'Meus Filhos', icon: '👨‍👩‍👧‍👦' },
          { to: '/parent/menu', label: 'Cardápio', icon: '🍽️' },
        ];
      case UserRole.STUDENT:
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: '📊' },
          { to: '/student/menu', label: 'Cardápio', icon: '🍽️' },
          { to: '/student/consumption', label: 'Meus Pedidos', icon: '📝' },
        ];
      case UserRole.CANTEEN:
        return [
          { to: '/canteen/dashboard', label: 'Dashboard', icon: '📊' },
          { to: '/canteen/scan', label: 'Escanear QR', icon: '📱' },
          { to: '/canteen/students', label: 'Alunos', icon: '👨‍🎓' },
          { to: '/canteen/products', label: 'Produtos', icon: '🍔' },
          { to: '/canteen/reports', label: 'Relatórios', icon: '📈' },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/admin/canteens', label: 'Cantinas', icon: '🏫' },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#1a73e8] via-[#4285f4] to-[#34a853] text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="text-2xl">🍎</span>
            <span className="text-xl font-semibold">Meu Lanche Digital</span>
          </Link>

          <div className="flex flex-wrap justify-center gap-4">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 hover:text-gray-200 transition-colors ${
                  isActive(link.to) ? 'font-semibold' : ''
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            {user && (
              <Button
                onClick={handleSignOut}
                variant="secondary"
                className="bg-[#fbbc05] text-white hover:bg-[#f9a825]"
              >
                Sair
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
    