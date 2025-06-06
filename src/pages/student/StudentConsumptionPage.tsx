import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabaseClient';
import { Order, OrderStatus } from '@/types/types';

const StudentConsumptionPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !profile || !profile.student_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', profile.student_id)
        .order('order_date', { ascending: false });

      if (fetchError) {
        console.error('Error fetching orders:', fetchError);
        setError('Falha ao carregar histórico de consumo.');
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Histórico de Consumo</h1>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">Nenhum consumo registrado ainda.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {new Date(order.order_date).toLocaleDateString()} - {new Date(order.order_date).toLocaleTimeString()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">R$ {order.total_amount.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
      </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentConsumptionPage;
    