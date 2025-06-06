import React, { useState, useEffect } from 'react';
import Card from '@components/ui/Card';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabaseClient';
import { Product } from '@/types/types';

const StudentMenuPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user || !profile || !profile.student_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Primeiro, buscar o canteen_id do aluno
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('canteen_id')
        .eq('id', profile.student_id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        setError('Falha ao carregar dados do aluno.');
        setLoading(false);
        return;
      }

      if (!studentData?.canteen_id) {
        setError('Aluno não está vinculado a nenhuma cantina.');
        setLoading(false);
        return;
      }

      // Depois, buscar os produtos da cantina
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('canteen_id', studentData.canteen_id)
        .eq('available', true)
        .query();

      if (productsError) {
        console.error('Error fetching products:', productsError);
        setError('Falha ao carregar cardápio.');
      } else {
        setProducts((productsData || []).sort((a: Product, b: Product) => a.name.localeCompare(b.name)));
      }
      setLoading(false);
    };

    fetchMenu();
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cardápio da Cantina</h1>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {products.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">Nenhum produto disponível no momento.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <img 
                src={product.image_url || 'https://picsum.photos/seed/productitem/300/200'} 
                alt={product.name} 
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/productfallback/300/200')}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                )}
                <p className="text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</p>
              </div>
      </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMenuPage;
    