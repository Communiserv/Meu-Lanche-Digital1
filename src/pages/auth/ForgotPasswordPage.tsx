import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@lib/supabaseClient';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se este email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Ocorreu um erro ao processar sua solicitação.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-4">
      <Card title="Recuperar Senha" className="w-full max-w-md bg-white/90">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />

          {message && (
            <div className={`p-3 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Voltar para o login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage; 