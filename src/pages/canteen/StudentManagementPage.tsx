import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@lib/supabaseClient';
import { useAuth } from '@contexts/AuthContext';
import { Student, UserRole } from '@/types/types';
import Card from '@components/ui/Card';

const StudentManagementPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!profile || !profile.canteen_id) {
      setError("Usuário da cantina não identificado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('canteen_id', profile.canteen_id)
      .query();

    if (fetchError) {
      console.error('Error fetching students:', fetchError);
      setError('Falha ao carregar alunos. Tente novamente.');
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  if (authLoading || isLoading) {
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

  if (profile.role !== UserRole.CANTEEN) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Acesso Negado">
          <p className="text-red-600">
            Apenas usuários da cantina podem acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Alunos da Cantina</h1>

      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}
      
      {/* Placeholder for Add/Edit student functionality - To be implemented later if needed 
      <div className="mb-6 text-right">
         <Button variant="primary">Adicionar Novo Aluno</Button>
      </div>
      */}

      {students.length === 0 && !isLoading ? (
        <Card>
            <p className="text-gray-500 text-center py-8">Nenhum aluno associado a esta cantina ainda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map(student => (
            <Card key={student.id} className="text-center">
              <img 
                src={student.photo_url || `https://picsum.photos/seed/${student.id}/150/150`} 
                alt={student.full_name} 
                className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-primary-light object-cover"
                onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/studentfallback/150/150')}
              />
              <h3 className="text-xl font-semibold text-primary mb-1">{student.full_name}</h3>
              {student.nickname && <p className="text-sm text-gray-500 mb-1">"{student.nickname}"</p>}
              <p className="text-gray-700 font-bold text-lg mb-2">Saldo: R$ {student.balance.toFixed(2)}</p>
              {student.daily_limit && <p className="text-xs text-gray-400">Limite Diário: R$ {student.daily_limit.toFixed(2)}</p>}
              <p className="text-xs text-gray-400 mt-2 break-all" title={student.qr_code_value}>QR: {student.qr_code_value.substring(0,20)}...</p>
              {/* Placeholder for Edit/View Details buttons 
              <div className="mt-4 space-x-2">
                <Button size="sm" variant="ghost">Editar</Button>
                <Button size="sm">Ver Detalhes</Button>
              </div>
              */}
            </Card>
          ))}
        </div>
      )}
       <Card className="mt-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Nota sobre Gerenciamento de Alunos</h3>
            <p className="text-sm text-blue-600">
                Atualmente, esta página permite apenas a visualização dos alunos vinculados à sua cantina. O cadastro e a edição detalhada de alunos (incluindo a vinculação com responsáveis) são tipicamente gerenciados pelos pais ou administradores da plataforma para garantir a integridade dos dados. Funcionalidades adicionais de gerenciamento pela cantina, como a geração de QR codes ou ajustes específicos, poderão ser adicionadas no futuro conforme a necessidade.
            </p>
        </Card>
    </div>
  );
};

export default StudentManagementPage;
