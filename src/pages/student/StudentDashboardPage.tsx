import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/ui/Card';
import QRCodeDisplay from '@components/common/QRCodeDisplay';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabaseClient';
import { Student, Product } from '@/types/types';
import Button from '@components/ui/Button';

const StudentDashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [canteenMenu, setCanteenMenu] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || !profile || !profile.student_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', profile.student_id)
        .single();

      if (error) {
        console.error('Error fetching student data:', error);
      } else if (data) {
        setStudentData(data);
        if (data.canteen_id) {
          const { data: menuData, error: menuError } = await supabase
            .from('products')
            .select('*')
            .eq('canteen_id', data.canteen_id)
            .eq('available', true)
            .query();
          if (menuError) console.error('Error fetching menu:', menuError);
          else setCanteenMenu(menuData || []);
        }
      }
      setLoading(false);
    };

    fetchStudentData();
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

  if (!studentData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Erro">
          <p className="text-red-600">
            Não foi possível carregar os dados do aluno. Verifique se seu cadastro está completo.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Meu Painel de Aluno</h1>
        <p className="text-gray-600">Olá, {studentData.full_name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-1">
             <Card className="bg-gradient-to-br from-accent-light to-accent text-white">
                 <div className="text-center mb-4">
                    <img src={studentData.photo_url || 'https://picsum.photos/seed/studentavatar/128/128'} alt={studentData.full_name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"/>
                    <h2 className="text-2xl font-semibold">{studentData.full_name}</h2>
                 </div>
                 <div className="text-center mb-6">
                    <p className="text-lg">Saldo Atual:</p>
                    <p className="text-5xl font-bold">R$ {studentData.balance.toFixed(2)}</p>
                    {studentData.daily_limit && <p className="text-sm mt-1 opacity-80">Limite de Gasto Diário: R$ {studentData.daily_limit.toFixed(2)}</p>}
                 </div>
                 <QRCodeDisplay value={studentData.qr_code_value} />
             </Card>
        </div>

        <div className="md:col-span-1">
          <Card title="Cardápio da Cantina">
            {canteenMenu.length > 0 ? (
              <ul className="space-y-3 max-h-[500px] overflow-y-auto">
                {canteenMenu.map(product => (
                  <li key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                        <img src={product.image_url || 'https://picsum.photos/seed/productitem/40/40'} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                        <div>
                            <h3 className="font-semibold text-gray-700">{product.name}</h3>
                            {product.description && <p className="text-xs text-gray-500">{product.description}</p>}
                        </div>
                    </div>
                    <span className="font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">O cardápio da cantina não está disponível no momento.</p>
            )}
             <div className="mt-6">
                <Link to="/student/consumption">
                    <Button fullWidth variant="ghost">Ver Meu Histórico de Consumo</Button>
                </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
