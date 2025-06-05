import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@lib/supabaseClient';
import { useAuth } from '@contexts/AuthContext';
import { Order, Student, Product, OrderStatus, OrderItem, UserRole } from '@/types/types';
import Card from '@components/ui/Card';

interface ReportStats {
  totalSales: number;
  totalOrders: number;
  mostSoldProduct: { name: string; count: number } | null;
  averageOrderValue: number;
  totalProducts: number;
  pendingOrders: number;
  dailyRevenue: number;
}

const ReportsPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [studentsMap, setStudentsMap] = useState<Map<string, string>>(new Map());
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    if (!profile || !profile.canteen_id) {
      setError("Usuário da cantina não identificado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Fetch orders for the canteen
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('canteen_id', profile.canteen_id)
        .query();

      if (ordersError) throw ordersError;
      const fetchedOrders = ordersData || [];
      setOrders(fetchedOrders.sort((a,b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()));

      // Fetch all students to map IDs to names
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name')
        .query();
      if (studentsError) console.warn('Could not fetch all students for name mapping:', studentsError);
      
      const sMap = new Map<string, string>();
      (studentsData || []).forEach((s: Pick<Student, 'id'|'full_name'>) => sMap.set(s.id, s.full_name));
      setStudentsMap(sMap);
      
      // Fetch products of the canteen for "most sold" calculation
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('canteen_id', profile.canteen_id)
        .query();
      if (productsError) console.warn('Could not fetch products for "most sold" stat:', productsError);
      const productsMap = new Map<string, string>();
      (productsData || []).forEach((p: Pick<Product, 'id'|'name'>) => productsMap.set(p.id, p.name));

      // Calculate stats
      const completedOrders = fetchedOrders.filter(o => o.status === OrderStatus.COMPLETED);
      const totalSales = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = fetchedOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / completedOrders.length : 0;

      const productCounts: { [productId: string]: number } = {};
      completedOrders.forEach(order => {
        order.items.forEach((item: OrderItem) => {
          productCounts[item.product_id] = (productCounts[item.product_id] || 0) + item.quantity;
        });
      });

      let mostSoldProduct: { name: string; count: number } | null = null;
      if (Object.keys(productCounts).length > 0) {
        const mostSoldProductId = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b);
        mostSoldProduct = {
          name: productsMap.get(mostSoldProductId) || `Produto ID: ${mostSoldProductId}`,
          count: productCounts[mostSoldProductId]
        };
      }
      
      const productsCount = productsData ? productsData.length : 0;
      
      setReportStats({
        totalSales,
        totalOrders,
        mostSoldProduct,
        averageOrderValue,
        totalProducts: productsCount,
        pendingOrders: 0, // Assuming pendingOrders is not provided in the original code
        dailyRevenue: 0, // Assuming dailyRevenue is not provided in the original code
      });

    } catch (e: any) {
      console.error('Error fetching report data:', e);
      setError(`Falha ao carregar dados do relatório: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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
  
  const recentOrdersToDisplay = orders.slice(0, 10); // Display last 10 orders for brevity

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Relatórios da Cantina</h1>

      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      {reportStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-white">
            <h2 className="text-lg font-semibold mb-1">Vendas Totais (Concluídas)</h2>
            <p className="text-3xl font-bold">R$ {reportStats.totalSales.toFixed(2)}</p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Total de Pedidos</h2>
            <p className="text-3xl font-bold text-gray-800">{reportStats.totalOrders}</p>
          </Card>
           <Card>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Valor Médio Pedido (Concluído)</h2>
            <p className="text-3xl font-bold text-gray-800">R$ {reportStats.averageOrderValue.toFixed(2)}</p>
          </Card>
          <Card className="bg-accent text-white">
            <h2 className="text-lg font-semibold mb-1">Produto Mais Vendido</h2>
            {reportStats.mostSoldProduct ? (
              <p className="text-xl font-bold">{reportStats.mostSoldProduct.name} <span className="text-sm">({reportStats.mostSoldProduct.count} un.)</span></p>
            ) : (
              <p className="text-xl font-bold">N/A</p>
            )}
          </Card>
        </div>
      )}

      <Card title={`Últimos ${recentOrdersToDisplay.length} Pedidos`}>
        {orders.length === 0 && !isLoading ? (
          <p className="text-gray-500 italic">Nenhum pedido encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrdersToDisplay.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(order.order_date).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{studentsMap.get(order.student_id) || 'Aluno Desconhecido'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">R$ {order.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
       <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Relatórios Avançados</h3>
            <p className="text-sm text-yellow-600">
                Esta é uma visualização básica dos relatórios. Funcionalidades futuras poderão incluir filtros por período, aluno, produto, exportação de dados e gráficos mais detalhados para uma análise aprofundada do desempenho da cantina.
            </p>
        </Card>
    </div>
  );
};

export default ReportsPage;
