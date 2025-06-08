import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { formatPhone, formatCEP, formatCPF, validateCPF } from '@/utils/formatters';

const ResponsibleRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação baseada no campo
    switch (name) {
      case 'phone':
        formattedValue = formatPhone(value);
        break;
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'zipCode':
        formattedValue = formatCEP(value);
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar senhas
      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      // Validar CPF
      if (!validateCPF(formData.cpf)) {
        toast.error('CPF inválido');
        return;
      }

      // Criar usuário no Supabase
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          role: 'responsible'
        }
      );

      if (authError) throw authError;

      // Criar perfil do responsável
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user?.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            role: 'responsible'
          }
        ]);

      if (profileError) throw profileError;

      toast.success('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastro de Responsável
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="E-mail"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Input
              label="Telefone"
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
            <Input
              label="CPF"
              type="text"
              name="cpf"
              required
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
            <Input
              label="Endereço"
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
            />
            <Input
              label="Cidade"
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="Estado"
              type="text"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              maxLength={2}
            />
            <Input
              label="CEP"
              type="text"
              name="zipCode"
              required
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="00000-000"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResponsibleRegistrationPage; 