import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { ROLES, NAV_ITEMS } from '@/constants';
import Button from '@components/ui/Button';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getNavLinks = () => {
    if (!user || !profile) {
      return NAV_ITEMS.PUBLIC;
    }

    switch (profile.role) {
      case ROLES.PARENT:
        return NAV_ITEMS.PARENT;
      case ROLES.STUDENT:
        return NAV_ITEMS.STUDENT;
      case ROLES.CANTEEN:
        return NAV_ITEMS.CANTEEN;
      case ROLES.ADMIN:
        return NAV_ITEMS.ADMIN;
      default:
        return [];
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍎</span>
            <span className="text-xl font-bold text-primary">Meu Lanche Digital</span>
          </Link>

          <div className="flex items-center space-x-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            {user && (
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className="ml-2 text-sm"
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
    