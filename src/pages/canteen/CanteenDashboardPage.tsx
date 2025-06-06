import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Order, OrderStatus, Product, Student, UserRole } from '@/types/types';
import Button from '@components/ui/Button';

const CanteenDashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, pendingOrders: 0, dailyRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile || !profile.canteen_id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('canteen_id', profile.canteen_id);
      
      const productsCount = productsData ? productsData.length : 0;

      const { data: allOrdersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('canteen_id', profile.canteen_id);

      const { data: allStudentsData, error: studentsFetchError } = await supabase
        .from('students')
        .select('id, full_name');

      if (ordersError || productsError || studentsFetchError) {
        console.error('Error fetching canteen data:', { ordersError, productsError, studentsFetchError });
      }

      const canteenOrders = (allOrdersData || [])
        .map((o: Order) => {
            const student = (allStudentsData || []).find((s: Pick<Student, 'id' | 'full_name'>) => s.id === o.student_id);
            return {...o, students: student ? {full_name: student.full_name} : {full_name: 'Aluno Desconhecido'}};
        })
        .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const todayOrders = canteenOrders.filter((o: Order) => {
        const orderDate = new Date(o.order_date);
        const today = new Date();
        return orderDate.getFullYear() === today.getFullYear() &&
               orderDate.getMonth() === today.getMonth() &&
               orderDate.getDate() === today.getDate() &&
               o.status === OrderStatus.COMPLETED;
      });
      const dailyRevenue = todayOrders.reduce((sum: number, order: Order) => sum + order.total_amount, 0);
      const pendingOrdersCount = canteenOrders.filter((o: Order) => o.status === OrderStatus.PENDING).length;

      setStats({
        totalProducts: productsCount,
        pendingOrders: pendingOrdersCount,
        dailyRevenue: dailyRevenue,
      });
      setRecentOrders(canteenOrders.slice(0,5));
      
      setLoading(false);
    };

    fetchData();
  }, [profile]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a73e8]">Painel da Cantina</h1>
          {profile && <p className="text-gray-600">Bem-vindo(a), {profile.full_name || profile.email}!</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#34a853] rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">Receita de Hoje</h2>
                <p className="text-3xl font-bold">R$ {stats.dailyRevenue.toFixed(2)}</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">Produtos Cadastrados</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
              <span className="text-4xl">🍔</span>
            </div>
          </Card>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-1">Pedidos Pendentes</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </Card>
          <div className="bg-[#fbbc05] rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ações Rápidas</h2>
                <span className="text-4xl">⚡</span>
              </div>
              <Link to="/canteen/scan">
                <Button 
                  fullWidth 
                  variant="secondary" 
                  className="bg-red-500 text-[#fbbc05] hover:bg-gray-300 transform hover:scale-105 transition-transform duration-200"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">📱</span>
                    Escanear QR Code
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Pedidos Recentes">
              {recentOrders.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentOrders.map(order => (
                    <li key={order.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary truncate">Pedido #{order.id.substring(0,8)}</p>
                          <p className="text-sm text-gray-500">Aluno: {(order as any).students?.full_name || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">R$ {order.total_amount.toFixed(2)}</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                            order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')} - {new Date(order.order_date).toLocaleTimeString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Nenhum pedido recente.</p>
              )}
            </Card>
          </div>
          
          <div>
            <Card title="Gerenciamento">
              <div className="space-y-3">
                <Link to="/canteen/products">
                  <Button fullWidth variant="ghost">Gerenciar Produtos (Cardápio)</Button>
                </Link>
                <Link to="/canteen/students">
                  <Button fullWidth variant="ghost">Gerenciar Alunos</Button>
                </Link>
                <Link to="/canteen/reports">
                  <Button fullWidth variant="ghost">Ver Relatórios</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-600">
          <p>© 2025 Meu Lanche Digital. Todos os direitos reservados.</p>
          <p className="text-sm mt-1">Simplificando a vida escolar.</p>
        </footer>
      </div>
    </div>
  );
};

export default CanteenDashboardPage;
