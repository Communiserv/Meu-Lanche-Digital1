import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { supabase } from '@lib/supabaseClient';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { Student, Transaction, TransactionType, TransactionMethod, TransactionStatus, UserRole } from '@/types/types';

const CredLanchePage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const location = useLocation();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dailyLimit, setDailyLimit] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentIdFromQuery = params.get('studentId');
    if (studentIdFromQuery) {
      setSelectedStudentId(studentIdFromQuery);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user || !profile || !profile.parent_id) {
        setMessage({ type: 'error', text: 'Usuário não identificado ou sem permissão.' });
        return;
      }
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', profile.parent_id)
        .query(); 
      if (error) {
        console.error("Error fetching children:", error);
        setMessage({ type: 'error', text: 'Erro ao buscar lista de filhos.' });
      } else {
        setChildren(data || []);
      }
    };
    fetchChildren();
  }, [user, profile]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!selectedStudentId) {
        setTransactionHistory([]);
        return;
      }
      setIsLoadingHistory(true);
      const {data: allTransactions, error} = await supabase
        .from('transactions')
        .select('*')
        .query(); 

      if (error) {
        console.error("Error fetching transaction history:", error);
        setMessage({ type: 'error', text: 'Erro ao buscar histórico de recargas.' });
        setTransactionHistory([]);
      } else {
        const studentTransactions = (allTransactions || [])
        .filter((tx: Transaction) => tx.student_id === selectedStudentId && tx.type === TransactionType.CREDIT)
        .sort((a:Transaction,b:Transaction) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTransactionHistory(studentTransactions);
      }
      setIsLoadingHistory(false);
    };

    if (selectedStudentId) {
        fetchTransactionHistory();
    }
  }, [selectedStudentId]); 

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || amount === '' || +amount <= 0) {
      setMessage({ type: 'error', text: 'Selecione um filho e insira um valor válido.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      console.log(`Iniciando PIX para adicionar R$${amount} ao aluno ${selectedStudentId}`);
      
      const { data: transactionData, error: insertError } = await supabase.from('transactions').insert({
        student_id: selectedStudentId,
        parent_id: profile?.id,
        type: TransactionType.CREDIT,
        amount: +amount,
        method: TransactionMethod.PIX,
        status: TransactionStatus.PENDING,
        description: 'Recarga CredLanche via PIX',
      });

      if (insertError) throw insertError;
      if (!transactionData || transactionData.length === 0) throw new Error("Falha ao registrar transação pendente.");
      
      const pendingTransaction = transactionData[0];

      setTimeout(async () => {
        try {
          const { error: updateStatusError } = await supabase
            .from('transactions')
            .update({ status: TransactionStatus.COMPLETED })
            .eq('id', pendingTransaction.id);
          
          if (updateStatusError) throw new Error(`Falha ao atualizar status da transação: ${updateStatusError.message}`);

          const { data: studentBalanceData, error: studentError } = await supabase
            .from('students')
            .select('balance')
            .eq('id', selectedStudentId)
            .single();
          
          if (studentError || !studentBalanceData) throw studentError || new Error("Aluno não encontrado para atualizar saldo.");
          
          const newBalance = studentBalanceData.balance + (+amount);
          const { error: updateBalanceError } = await supabase
            .from('students')
            .update({ balance: newBalance })
            .eq('id', selectedStudentId);

          if (updateBalanceError) throw new Error(`Falha ao atualizar saldo do aluno: ${updateBalanceError.message}`);
          
          setMessage({ type: 'success', text: `Crédito de R$${(+amount).toFixed(2)} adicionado com sucesso! (Simulado)` });
          setAmount('');
          
          setChildren(prevChildren => prevChildren.map(c => c.id === selectedStudentId ? {...c, balance: newBalance} : c));
           setTransactionHistory(prevHistory => [{...pendingTransaction, status: TransactionStatus.COMPLETED, amount: +amount, created_at: new Date().toISOString()}, ...prevHistory]
            .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
           );

          setLoading(false);
        } catch (simulatedPixError: any) {
            console.error("Error during simulated PIX confirmation:", simulatedPixError);
            setMessage({ type: 'error', text: `Erro na confirmação do PIX (simulado): ${simulatedPixError.message}` });
            await supabase.from('transactions').update({ status: TransactionStatus.FAILED }).eq('id', pendingTransaction.id);
            setLoading(false);
        }
      }, 2000);

    } catch (err: any) {
      setMessage({ type: 'error', text: `Erro ao adicionar crédito: ${err.message}` });
      setLoading(false);
    }
  };

  const handleSetDailyLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || dailyLimit === '' || +dailyLimit < 0) {
      setMessage({ type: 'error', text: 'Selecione um filho e insira um limite diário válido (0 para remover).' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('students')
        .update({ daily_limit: +dailyLimit === 0 ? null : +dailyLimit })
        .eq('id', selectedStudentId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Limite diário configurado com sucesso!' });
      setDailyLimit('');
      setChildren(prevChildren => prevChildren.map(c => c.id === selectedStudentId ? {...c, daily_limit: (+dailyLimit === 0 ? undefined : +dailyLimit)} : c));

    } catch (err: any) {
      setMessage({ type: 'error', text: `Erro ao configurar limite: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
  
  const currentChild = children.find(c => c.id === selectedStudentId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">CredLanche & Limites</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Adicionar Crédito via PIX">
          <form onSubmit={handleAddCredit} className="space-y-4">
            <div>
              <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Filho:
              </label>
              <select
                id="studentSelect"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Selecione um filho --</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.full_name} (Saldo: R$ {child.balance.toFixed(2)})</option>
                ))}
              </select>
            </div>
            <Input
              label="Valor do Crédito (R$)"
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0.01"
              step="0.01"
              required
              disabled={!selectedStudentId || loading}
            />
            <Button type="submit" disabled={loading || !selectedStudentId} fullWidth>
              {loading ? 'Processando PIX...' : 'Gerar PIX para Pagamento'}
            </Button>
            {loading && <p className="text-sm text-yellow-600 text-center mt-2">Aguardando confirmação do pagamento PIX. Isso pode levar alguns instantes.</p>}
          </form>
        </Card>

        <Card title="Configurar Limite Diário de Gastos">
          <form onSubmit={handleSetDailyLimit} className="space-y-4">
             <div>
              <label htmlFor="studentSelectLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Filho:
              </label>
              <select
                id="studentSelectLimit"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Selecione um filho --</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.full_name} (Limite atual: R$ {child.daily_limit?.toFixed(2) || 'Nenhum'})</option>
                ))}
              </select>
            </div>
            <Input
              label="Novo Limite Diário (R$) (0 para remover)"
              type="number"
              id="dailyLimit"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0"
              step="0.01"
              disabled={!selectedStudentId || loading}
            />
            <Button type="submit" disabled={loading || !selectedStudentId} variant="secondary" fullWidth>
              {loading ? 'Salvando...' : 'Salvar Limite Diário'}
            </Button>
          </form>
        </Card>
      </div>

      {selectedStudentId && currentChild && (
        <div className="mt-8">
          <Card title={`Histórico de Recargas de ${currentChild.full_name}`}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-2 text-sm text-gray-600">Carregando histórico...</p>
              </div>
            ) : transactionHistory.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {transactionHistory.map(tx => (
                  <li key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-600">
                        + R$ {tx.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{tx.description} - {new Date(tx.created_at).toLocaleString()}</p>
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
            ) : (
              <p className="text-gray-500 italic">Nenhuma recarga encontrada para este filho.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default CredLanchePage;
