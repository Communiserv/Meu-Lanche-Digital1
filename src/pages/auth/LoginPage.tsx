import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { UserRole } from '@/types/types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, loading, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
    }
  };

  React.useEffect(() => {
    if (user && profile) {
      // Redirect based on role
      if (profile.role === UserRole.PARENT) navigate('/parent/dashboard');
      else if (profile.role === UserRole.STUDENT) navigate('/student/dashboard');
      else if (profile.role === UserRole.CANTEEN) navigate('/canteen/dashboard');
      else if (profile.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else navigate('/'); // Fallback to home
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-primary to-primary-dark p-4">
      <Card title="Login - Meu Lanche Digital" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>}
          />
          <Input
            label="Senha"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} fullWidth className="bg-primary-600 hover:bg-primary-700 text-white font-semibold">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="flex justify-between items-center text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700">
              Esqueceu sua senha?
            </Link>
            <Link to="/register" className="text-primary-600 hover:text-primary-700">
              Criar conta
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
    