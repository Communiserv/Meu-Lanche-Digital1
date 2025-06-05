import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabaseClient';
import { Student, Product, Order, OrderStatus, OrderItem, TransactionType, TransactionMethod, TransactionStatus, Transaction, UserRole } from '@/types/types';
// import { QrReader } from 'react-qr-reader'; // Real QR reader
import Input from '@components/ui/Input';

interface MockQrReaderProps {
  onResult: (error: Error | null, data: { getText: () => string } | null) => void;
  scanDelay?: number;
  videoStyle?: React.CSSProperties;
  constraints?: any;
}

const MockQrReader: React.FC<MockQrReaderProps> = ({ onResult }) => {
  const [mockQrValue, setMockQrValue] = useState('STUDENT_QR_CODE_123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMockValue = useCallback(() => {
    if (mockQrValue.trim() === '') {
        onResult(new Error("Mock QR value is empty"), null);
        return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onResult(null, { getText: () => mockQrValue });
      setIsSubmitting(false);
    }, 500);
  },[mockQrValue, onResult]);


  return (
    <div className="border border-gray-300 p-4 text-center bg-gray-50 rounded-lg">
      <p className="text-gray-600 mb-2">Simulador de Leitor de QR Code:</p>
      <Input
        type="text"
        value={mockQrValue}
        onChange={(e) => setMockQrValue(e.target.value)}
        placeholder="Digite o valor do QR Code"
        className="mb-2"
      />
      <Button onClick={submitMockValue} disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'Lendo...' : 'Simular Leitura'}
      </Button>
       <p className="text-xs text-gray-400 mt-2">Em produção, a câmera será ativada aqui.</p>
    </div>
  );
};


const QRCodeScanPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [scanResultText, setScanResultText] = useState<string | null>(null); 
  const [studentData, setStudentData] = useState<Student | null>(null);
  
  // Cart states
  const [currentCartItems, setCurrentCartItems] = useState<OrderItem[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);

  // Product selection states
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [loading, setLoading] = useState<boolean>(false); // For purchase processing
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!profile || !profile.canteen_id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('canteen_id', profile.canteen_id)
        .eq('available', true)
        .query();

      if (error) {
        console.error('Erro ao carregar produtos:', error.message);
        setMessage({type: 'error', text: 'Erro ao carregar produtos.'});
      } else {
        setProducts(data || []); 
      }
      setLoading(false);
    };
    fetchProducts();
  }, [profile]);

  const resetCart = () => {
    setCurrentCartItems([]);
    setCartTotal(0);
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleScanResult = (error: Error | null, resultData: { getText: () => string } | null) => {
    resetCart(); // Clear previous student's cart
    setStudentData(null); // Clear previous student data

    if (resultData) {
      const qrText = resultData.getText();
      setScanResultText(qrText); 
      setMessage({type: 'info', text: `QR Code "${qrText}" detectado. Buscando aluno...`});
      fetchStudentByQrCode(qrText);
    } else if (error) { 
      console.info("QR Scan Error/Info:", error.message);
      setMessage({type: 'error', text: `Leitor de QR: ${error.message}. Tente novamente.`});
      setScanResultText(null);
    }
  };
  
  const fetchStudentByQrCode = async (qrCodeValue: string) => {
      setLoading(true);
      const { data: student, error: studentDbError } = await supabase
        .from('students')
        .select('*')
        .eq('qr_code_value', qrCodeValue)
        .single();
      setLoading(false);

      if (studentDbError || !student) {
        setMessage({type: 'error', text: 'QR Code inválido ou aluno não encontrado.'});
        setStudentData(null);
      } else {
        setStudentData(student);
        setMessage({type: 'success', text: `Aluno encontrado: ${student.full_name}. Saldo: R$${student.balance.toFixed(2)}`});
      }
  };

  const handleAddProductToCart = () => {
    if (!selectedProductId || quantity <= 0) {
      setMessage({type: 'error', text: "Selecione um produto e quantidade válida."});
      return;
    }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) {
      setMessage({type: 'error', text: "Produto não encontrado."});
      return;
    }

    const newItem: OrderItem = {
      product_id: product.id,
      name: product.name,
      quantity: quantity,
      price_at_purchase: product.price,
    };

    // Check if item already in cart, if so, update quantity (optional, for now just add)
    // For simplicity, we'll just add it. A more robust solution might update existing item quantity.
    setCurrentCartItems(prevItems => [...prevItems, newItem]);
    setCartTotal(prevTotal => prevTotal + (newItem.price_at_purchase * newItem.quantity));
    
    // Reset for next item
    setSelectedProductId('');
    setQuantity(1);
    setMessage({type: 'info', text: `${product.name} (x${quantity}) adicionado ao pedido.`});
  };

  const handleRemoveProductFromCart = (productIdToRemove: string, indexToRemove: number) => {
    const itemToRemove = currentCartItems.find((item, index) => item.product_id === productIdToRemove && index === indexToRemove);
    if (itemToRemove) {
        setCartTotal(prevTotal => prevTotal - (itemToRemove.price_at_purchase * itemToRemove.quantity));
        setCurrentCartItems(prevItems => prevItems.filter((item, index) => !(item.product_id === productIdToRemove && index === indexToRemove) ));
        setMessage({type: 'info', text: `${itemToRemove.name} removido do pedido.`});
    }
  };


  const handlePurchase = async () => {
    if (!studentData || currentCartItems.length === 0) {
      setMessage({type: 'error', text: 'Nenhum aluno selecionado ou o carrinho está vazio.'});
      return;
    }

    if (studentData.balance < cartTotal) {
      setMessage({type: 'error', text: `Saldo insuficiente. Saldo: R$${studentData.balance.toFixed(2)}, Pedido: R$${cartTotal.toFixed(2)}`});
      return;
    }
    
    if (studentData.daily_limit !== null && studentData.daily_limit !== undefined) {
        // Consider cumulative daily spending if this is a real app
        if (cartTotal > studentData.daily_limit) {
             setMessage({type: 'error', text: `O valor do pedido (R$ ${cartTotal.toFixed(2)}) excede o limite diário (R$ ${studentData.daily_limit.toFixed(2)}) configurado.`});
             return;
        }
    }

    setLoading(true);
    setMessage(null);

    try {
      const newBalance = studentData.balance - cartTotal;
      const { error: updateError } = await supabase
        .from('students')
        .update({ balance: newBalance })
        .eq('id', studentData.id);

      if (updateError) throw updateError;

      const orderPayload: Omit<Order, 'id' | 'created_at' | 'order_date'> = { 
        student_id: studentData.id,
        canteen_id: studentData.canteen_id, 
        items: currentCartItems,
        total_amount: cartTotal,
        status: OrderStatus.COMPLETED,
      };
      const { error: orderError } = await supabase.from('orders').insert(orderPayload);
      if (orderError) throw orderError;

      const transactionPayload: Omit<Transaction, 'id' | 'created_at'> = { 
        student_id: studentData.id,
        type: TransactionType.DEBIT,
        amount: cartTotal,
        method: TransactionMethod.CASHLESS,
        status: TransactionStatus.COMPLETED,
        description: `Compra de ${currentCartItems.length} tipo(s) de item(ns).`,
      };
      const { error: transactionError } = await supabase.from('transactions').insert(transactionPayload);
      if (transactionError) throw transactionError;

      setMessage({type: 'success', text: `Compra de R$${cartTotal.toFixed(2)} realizada com sucesso! Novo saldo de ${studentData.full_name}: R$${newBalance.toFixed(2)}`});
      
      // Reset for next transaction
      setStudentData(null); 
      setScanResultText(null);
      resetCart();

    } catch (err: any) {
      setMessage({type: 'error', text: `Erro na compra: ${err.message}. O saldo pode não ter sido atualizado.`});
      // Potentially revert student balance if other operations failed (complex rollback logic)
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leitura de QR Code e Consumo</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' :
            message.type === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card title="1. Escanear QR Code do Aluno">
            <MockQrReader 
                onResult={handleScanResult}
                constraints={{ facingMode: 'environment' }}
            />
            {scanResultText && !studentData && !loading && (
                 <p className="mt-3 text-sm text-yellow-600">Buscando dados do aluno para o QR Code: <span className="font-mono bg-gray-100 p-1 rounded">{scanResultText}</span>...</p>
            )}
        </Card>

        {studentData && (
          <Card title={`2. Montar Pedido para: ${studentData.full_name}`}>
            <div className="text-center mb-4 p-3 bg-primary-light/10 rounded-lg">
                {studentData.photo_url && (
                    <img src={studentData.photo_url} alt="Foto do Aluno" className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-primary" />
                )}
                <h3 className="text-lg font-semibold text-primary">{studentData.full_name}</h3>
                <p className="text-md">Saldo Atual: <span className="font-bold">R$ {studentData.balance.toFixed(2)}</span></p>
                {studentData.daily_limit !== null && studentData.daily_limit !== undefined && (
                    <p className="text-xs text-gray-500">Limite Diário: R$ {studentData.daily_limit.toFixed(2)}</p>
                )}
            </div>

            <div className="space-y-3 border p-4 rounded-md mb-4">
              <h4 className="text-md font-semibold text-gray-700">Adicionar Item ao Pedido:</h4>
              <div>
                <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Produto:
                </label>
                <select
                  id="productSelect"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Selecione um produto --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Quantidade:"
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} 
                min="1"
                disabled={loading || !selectedProductId}
              />
              <Button onClick={handleAddProductToCart} disabled={loading || !selectedProductId || quantity <= 0} fullWidth variant="secondary">
                Adicionar Item ao Pedido
              </Button>
            </div>
            
            {currentCartItems.length > 0 && (
                <div className="border p-4 rounded-md">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Itens no Pedido Atual:</h4>
                    <ul className="space-y-2 max-h-60 overflow-y-auto mb-3">
                        {currentCartItems.map((item, index) => (
                            <li key={`${item.product_id}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <span className="font-medium text-sm">{item.name} (x{item.quantity})</span>
                                    <span className="text-xs text-gray-500 block">R$ {item.price_at_purchase.toFixed(2)} cada</span>
                                </div>
                                <div className="flex items-center">
                                     <span className="text-sm font-semibold mr-3">R$ {(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                    <Button
                                        onClick={() => handleRemoveProductFromCart(item.product_id, index)}
                                        variant="danger"
                                        size="sm"
                                        className="p-1 aspect-square"
                                        aria-label={`Remover ${item.name}`}
                                        disabled={loading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t text-right">
                        <p className="text-xl font-bold text-primary">Total do Pedido: R$ {cartTotal.toFixed(2)}</p>
                    </div>
                     <Button onClick={handlePurchase} disabled={loading || currentCartItems.length === 0} fullWidth className="mt-4">
                        {loading ? 'Processando Compra...' : 'Finalizar Compra'}
                    </Button>
                </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanPage;
    