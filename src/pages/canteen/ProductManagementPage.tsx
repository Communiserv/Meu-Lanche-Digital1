import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@lib/supabaseClient';
import { useAuth } from '@contexts/AuthContext';
import { Product, ProductCategory } from '@/types/types';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { toast } from 'react-hot-toast';

const CATEGORY_LABELS = {
  [ProductCategory.SNACK]: 'Lanche',
  [ProductCategory.DRINK]: 'Bebida',
  [ProductCategory.MEAL]: 'Refeição',
  [ProductCategory.DESSERT]: 'Sobremesa',
  [ProductCategory.OTHER]: 'Outro'
};

const ProductManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true,
    category: ProductCategory.SNACK
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
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      toast.error('Falha ao carregar produtos');
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile?.canteen_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      image_url: '', 
      available: true,
      category: ProductCategory.SNACK 
    });
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
        category: productToEdit.category
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (!profile || !profile.canteen_id) {
      toast.error("ID da cantina não encontrado");
      return;
    }

    setIsLoading(true);
    setError(null);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      canteen_id: profile.canteen_id,
    };

    try {
      let response;
      if (editingProduct) {
        response = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        response = await supabase.from('products').insert(productData);
      }

      if (response.error) throw response.error;

      toast.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
      await fetchProducts();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Erro ao salvar produto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    if (!profile || !profile.canteen_id) {
      toast.error("ID da cantina não encontrado");
      return;
    }

    try {
      setIsLoading(true);
      const { error: updateError } = await supabase
        .from('products')
        .update({ available: !product.available })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast.success(`Produto ${!product.available ? 'disponibilizado' : 'indisponibilizado'} com sucesso!`);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error(`Erro ao alterar disponibilidade: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (!profile || !profile.canteen_id) {
      toast.error("ID da cantina não encontrado");
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) return;

    try {
      setIsLoading(true);
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
    
      if (deleteError) throw deleteError;

      toast.success('Produto excluído com sucesso!');
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Erro ao excluir produto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductsByCategory = () => {
    return products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<ProductCategory, Product[]>);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const productsByCategory = getProductsByCategory();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Adicionar Novo Produto
        </Button>
      </div>

      {products.length === 0 && !isLoading ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            Nenhum produto cadastrado ainda. Clique em "Adicionar Novo Produto" para começar.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {CATEGORY_LABELS[category as ProductCategory]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                  <Card key={product.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                      <div className="relative h-40 mb-3">
                        <img 
                          src={product.image_url || 'https://picsum.photos/seed/productplaceholder/300/200'} 
                          alt={product.name} 
                          className="w-full h-full object-cover rounded-t-lg"
                          onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/productfallback/300/200')}
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                          product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.available ? 'Disponível' : 'Indisponível'}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-1">{product.name}</h3>
                      <p className="text-gray-700 font-bold text-lg mb-2">R$ {product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2" title={product.description}>
                        {product.description || 'Sem descrição'}
                      </p>
                    </div>
                    <div className="mt-auto space-y-2">
                      <Button 
                        onClick={() => handleOpenModal(product)} 
                        size="sm" 
                        fullWidth 
                        variant="ghost"
                      >
                        Editar
                      </Button>
                      <Button 
                        onClick={() => handleToggleAvailability(product)} 
                        size="sm" 
                        fullWidth 
                        variant={product.available ? 'secondary' : 'ghost'} 
                        className={product.available ? '' : 'border-green-500 text-green-600 hover:bg-green-50'}
                      >
                        {product.available ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
                      </Button>
                      <Button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        size="sm" 
                        fullWidth 
                        variant="danger"
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-white">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <Input 
                  label="Nome do Produto" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
                <div>
                  <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                    Descrição
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={3} 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Categoria
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input 
                  label="Preço (R$)" 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={handleInputChange} 
                  required 
                />
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Imagem do Produto
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.image_url && (
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary-dark"
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="available" 
                    name="available" 
                    checked={formData.available} 
                    onChange={handleInputChange} 
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary-light" 
                  />
                  <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                    Produto Disponível
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    onClick={handleCloseModal} 
                    variant="ghost" 
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading || uploadingImage}
                  >
                    {isLoading ? (editingProduct ? 'Salvando...' : 'Adicionando...') : (editingProduct ? 'Salvar Alterações' : 'Adicionar Produto')}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;
