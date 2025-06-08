import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface CanteenFormData {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  opening_time: string;
  closing_time: string;
  responsible_name: string;
  responsible_phone: string;
  responsible_email: string;
}

const CanteenRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CanteenFormData>({
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    opening_time: '',
    closing_time: '',
    responsible_name: '',
    responsible_phone: '',
    responsible_email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (phone: string) => {
    return phone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da cantina é obrigatório');
      return false;
    }
    if (!formData.cnpj.replace(/\D/g, '').match(/^\d{14}$/)) {
      toast.error('CNPJ inválido');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Endereço é obrigatório');
      return false;
    }
    if (!formData.phone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
      toast.error('Telefone inválido');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Email inválido');
      return false;
    }
    if (!formData.opening_time || !formData.closing_time) {
      toast.error('Horário de funcionamento é obrigatório');
      return false;
    }
    if (!formData.responsible_name.trim()) {
      toast.error('Nome do responsável é obrigatório');
      return false;
    }
    if (!formData.responsible_phone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
      toast.error('Telefone do responsável inválido');
      return false;
    }
    if (!formData.responsible_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Email do responsável inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user || !profile) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Criar registro da cantina
      const { data: canteen, error: canteenError } = await supabase
        .from('canteens')
        .insert({
          name: formData.name,
          cnpj: formData.cnpj.replace(/\D/g, ''),
          address: formData.address,
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email,
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          responsible_name: formData.responsible_name,
          responsible_phone: formData.responsible_phone.replace(/\D/g, ''),
          responsible_email: formData.responsible_email,
          status: 'pending'
        })
        .select()
        .single();

      if (canteenError) throw canteenError;

      // 2. Criar solicitação de aprovação
      const { error: approvalError } = await supabase
        .from('canteen_approvals')
        .insert({
          canteen_id: canteen.id,
          user_id: user.id,
          status: 'pending'
        });

      if (approvalError) throw approvalError;

      // 3. Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ canteen_id: canteen.id })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação.');
      navigate('/canteen/dashboard');
    } catch (error: any) {
      console.error('Error registering canteen:', error);
      toast.error('Erro ao cadastrar cantina. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastro da Cantina</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome da Cantina"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                required
                maxLength={18}
              />
            </div>

            <Input
              label="Endereço Completo"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                required
                maxLength={15}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Horário de Abertura"
                name="opening_time"
                type="time"
                value={formData.opening_time}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Horário de Fechamento"
                name="closing_time"
                type="time"
                value={formData.closing_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do Responsável</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome do Responsável"
                  name="responsible_name"
                  value={formData.responsible_name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Telefone do Responsável"
                  name="responsible_phone"
                  value={formData.responsible_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsible_phone: formatPhone(e.target.value) }))}
                  required
                  maxLength={15}
                />
              </div>
              <div className="mt-6">
                <Input
                  label="Email do Responsável"
                  name="responsible_email"
                  type="email"
                  value={formData.responsible_email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Cantina'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CanteenRegistrationPage; 