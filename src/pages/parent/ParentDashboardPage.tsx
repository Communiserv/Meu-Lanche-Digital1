import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabaseClient';
import { Student, Transaction, TransactionType, TransactionStatus, UserRole } from '@/types/types';

const ParentDashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !profile || !profile.parent_id) {
        setLoading(false);
        setError("Usuário não identificado ou sem permissão.");
        return;
      }
      setLoading(true);
      setError(null);
      
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', profile.parent_id)
          .query(); 

        if (studentsError) {
          console.error('Error fetching children:', studentsError);
          setError('Falha ao carregar dados dos filhos. Tente novamente.');
        } else {
          setChildren(studentsData || []);
        }

        if (studentsData && studentsData.length > 0) {
          const studentIds = studentsData.map((s: Student) => s.id);
          
          const { data: allMockTransactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .query(); 
        
          if (transactionsError) {
            console.error('Error fetching transactions:', transactionsError);
            setError('Falha ao carregar transações. Tente novamente.');
          } else {
            const filteredTransactions = (allMockTransactions || [])
              .filter((t: Transaction) => studentIds.includes(t.student_id))
              .sort((a: Transaction, b: Transaction) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0,5);
            setRecentTransactions(filteredTransactions);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Ocorreu um erro inesperado. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Acesso Negado">
          <p className="text-red-600">
            Você precisa estar autenticado para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  if (profile.role !== UserRole.PARENT) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Acesso Negado">
          <p className="text-red-600">
            Apenas responsáveis podem acessar esta página.
          </p>
        </Card>
      </div>
    );
  }
  
  const totalBalance = children.reduce((acc, child) => acc + child.balance, 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel do Responsável</h1>
        {profile && <p className="text-gray-600">Bem-vindo(a), {profile.full_name}!</p>}
      </div>

      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary text-white">
          <h2 className="text-xl font-semibold mb-2">Saldo Total dos Filhos</h2>
          <p className="text-4xl font-bold">R$ {totalBalance.toFixed(2)}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link to="/parent/credlanche">
              <Button fullWidth>Adicionar Crédito (CredLanche)</Button>
            </Link>
            <Link to="/parent/manage-children">
              <Button fullWidth variant="secondary">Gerenciar Filhos</Button>
            </Link>
             <Link to="/parent/menu">
              <Button fullWidth variant="ghost">Ver Cardápio da Cantina</Button>
            </Link>
          </div>
        </Card>
         <Card>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Notificações</h2>
          <p className="text-gray-500 italic">Nenhuma notificação nova por enquanto.</p>
          {/* Placeholder for notifications */}
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Meus Filhos</h2>
        {children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} title={child.full_name}>
                <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={child.photo_url || `https://picsum.photos/seed/${child.id}/64/64`} 
                      alt={child.full_name} 
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/avatar/64/64')}
                    />
                    <div>
                        <p className="text-gray-700">Saldo: <span className="font-bold text-primary">R$ {child.balance.toFixed(2)}</span></p>
                        {child.daily_limit && <p className="text-sm text-gray-500">Limite Diário: R$ {child.daily_limit.toFixed(2)}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Link to={`/parent/consumption/${child.id}`}>
                        <Button size="sm" variant="ghost" fullWidth>Ver Consumo</Button>
                    </Link>
                     <Link to={`/parent/credlanche?studentId=${child.id}`}>
                        <Button size="sm" fullWidth>Adicionar Crédito</Button>
                    </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum filho cadastrado ainda. <Link to="/parent/manage-children" className="text-primary hover:underline">Cadastre agora</Link>.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Últimas Transações (Todos os Filhos)</h2>
        {recentTransactions.length > 0 ? (
          <Card>
            <ul className="divide-y divide-gray-200">
              {recentTransactions.map(tx => (
                <li key={tx.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${tx.type === TransactionType.CREDIT ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === TransactionType.CREDIT ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{tx.description || (tx.type === TransactionType.CREDIT ? 'Recarga' : 'Compra')} - {new Date(tx.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">Aluno: {children.find(c => c.id === tx.student_id)?.full_name || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tx.status === TransactionStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                    tx.status === TransactionStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                    {tx.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <p className="text-gray-500 italic">Nenhuma transação recente.</p>
        )}
      </div>
    </div>
  );
};

export default ParentDashboardPage;
