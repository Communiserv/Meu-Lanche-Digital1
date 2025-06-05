import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@lib/supabaseClient';
import { useAuth } from '@contexts/AuthContext';
import { Product } from '@/types/types';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';

const ProductManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true,
  });

  const fetchProducts = useCallback(async () => {
    if (!profile || !profile.canteen_id) {
      setError("Usuário da cantina não identificado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('canteen_id', profile.canteen_id)
      .query();

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      setError('Falha ao carregar produtos. Tente novamente.');
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', image_url: '', available: true });
    setEditingProduct(null);
  };

  const handleOpenModal = (productToEdit: Product | null = null) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        price: productToEdit.price.toString(),
        image_url: productToEdit.image_url || '',
        available: productToEdit.available,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !profile.canteen_id) {
        setError("Não é possível salvar: ID da cantina não encontrado.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      canteen_id: profile.canteen_id,
    };

    let response;
    if (editingProduct) {
      response = await supabase
        .from('products')
        .eq('canteen_id', profile.canteen_id)
        .update(productData)
        .eq('id', editingProduct.id);
    } else {
      response = await supabase.from('products').insert(productData);
    }

    if (response.error) {
      console.error('Error saving product:', response.error);
      setError(`Falha ao salvar produto: ${response.error.message}`);
    } else {
      await fetchProducts();
      handleCloseModal();
    }
    setIsLoading(false);
  };

  const handleToggleAvailability = async (product: Product) => {
    if (!profile || !profile.canteen_id) {
        setError("Não é possível alterar: ID da cantina não encontrado.");
        return;
    }
    setIsLoading(true);
    const { error: updateError } = await supabase
      .from('products')
      .eq('canteen_id', profile.canteen_id)
      .update({ available: !product.available })
      .eq('id', product.id);

    if (updateError) {
      setError(`Erro ao alterar disponibilidade: ${updateError.message}`);
    } else {
      await fetchProducts();
    }
    setIsLoading(false);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (!profile || !profile.canteen_id) {
        setError("Não é possível deletar: ID da cantina não encontrado.");
        return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;

    setIsLoading(true);
    const { error: deleteError } = await supabase
        .from('products')
        .eq('canteen_id', profile.canteen_id)
        .delete()
        .eq('id', productId);
    
    if (deleteError) {
        setError(`Erro ao excluir produto: ${deleteError.message}`);
    } else {
        await fetchProducts();
    }
    setIsLoading(false);
  };


  if (isLoading && products.length === 0) {
    return <div className="p-6 text-center">Carregando produtos...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos (Cardápio)</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Adicionar Novo Produto
        </Button>
      </div>

      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      {products.length === 0 && !isLoading ? (
        <Card>
            <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado ainda. Clique em "Adicionar Novo Produto" para começar.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="flex flex-col justify-between">
              <div>
                <img 
                    src={product.image_url || 'https://picsum.photos/seed/productplaceholder/300/200'} 
                    alt={product.name} 
                    className="w-full h-40 object-cover rounded-t-lg mb-3"
                    onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/productfallback/300/200')}
                />
                <h3 className="text-xl font-semibold text-primary mb-1">{product.name}</h3>
                <p className="text-gray-700 font-bold text-lg mb-2">R$ {product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-2 truncate" title={product.description}>{product.description || 'Sem descrição'}</p>
                <p className={`text-sm font-medium mb-3 ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                  {product.available ? 'Disponível' : 'Indisponível'}
                </p>
              </div>
              <div className="mt-auto space-y-2">
                <Button onClick={() => handleOpenModal(product)} size="sm" fullWidth variant="ghost">Editar</Button>
                <Button onClick={() => handleToggleAvailability(product)} size="sm" fullWidth variant={product.available ? 'secondary' : 'ghost'} className={product.available ? '' : 'border-green-500 text-green-600 hover:bg-green-50'}>
                  {product.available ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
                </Button>
                <Button onClick={() => handleDeleteProduct(product.id)} size="sm" fullWidth variant="danger">Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'} className="w-full max-w-lg bg-white">
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <Input label="Nome do Produto" name="name" value={formData.name} onChange={handleInputChange} required />
              <div>
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light"></textarea>
              </div>
              <Input label="Preço (R$)" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
              <Input label="URL da Imagem (opcional)" name="image_url" value={formData.image_url} onChange={handleInputChange} />
              <div className="flex items-center">
                <input type="checkbox" id="available" name="available" checked={formData.available} onChange={handleInputChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary-light" />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">Produto Disponível</label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-3">
                <Button type="button" onClick={handleCloseModal} variant="ghost" disabled={isLoading}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? (editingProduct ? 'Salvando...' : 'Adicionando...') : (editingProduct ? 'Salvar Alterações' : 'Adicionar Produto')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;
