import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { UserRole } from '@/types/types';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [error, setError] = useState<string | null>(null);
  const { signUp, loading, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    try {
      await signUp(email, password, { full_name: fullName, role });
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar. Tente novamente.');
    }
  };
  
  React.useEffect(() => {
    if (user && profile) {
      // Redirect based on role after successful registration and login
      if (profile.role === UserRole.PARENT) navigate('/parent/dashboard');
      else if (profile.role === UserRole.STUDENT) navigate('/student/dashboard');
      else if (profile.role === UserRole.CANTEEN) navigate('/canteen/dashboard');
      else if (profile.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else navigate('/'); 
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-4">
      <Card title="Registro - Meu Lanche Digital" className="w-full max-w-md bg-white/90">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome Completo"
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Seu nome completo"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}
          />
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
          <Input
            label="Confirmar Senha"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="********"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conta:
            </label>
            <select
              id="role"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value={UserRole.PARENT}>Responsável</option>
              <option value={UserRole.CANTEEN}>Cantina</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} fullWidth className="bg-primary-600 hover:bg-primary-700 text-white font-semibold">
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Faça login aqui
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
    