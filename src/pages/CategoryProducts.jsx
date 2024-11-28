import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import QuotationForm from '../components/QuotationForm';
import Toast from '../components/Toast';

const CategoryProducts = ({ showCart, setShowCart }) => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        const categoryResponse = await fetch(`${import.meta.env.VITE_API_URL}/categories/${categorySlug}`);
        if (!categoryResponse.ok) throw new Error('Categoría no encontrada');
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        const productsResponse = await fetch(`${import.meta.env.VITE_API_URL}/products/by-category/${categorySlug}`);
        if (!productsResponse.ok) throw new Error('Error al cargar los productos');
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categorySlug]);

  const handleQuotationRequest = () => {
    setShowCart(false);
    setShowQuotationForm(true);
  };

  const handleClearCart = () => {
    clearCart();
    setAddMessage('Carrito limpiado exitosamente');
    setTimeout(() => setAddMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Categoría no encontrada'}
          </h2>
          <button
            onClick={() => navigate('/catalogo')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Category Info */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/catalogo')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-300 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Volver al catálogo</span>
          </button>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500 text-lg">
              No se encontraron productos en esta categoría
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Productos disponibles
                <span className="ml-2 text-lg text-gray-500">({products.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map(product => (
                <div 
                  key={product._id}
                  className="transform transition-all duration-300 hover:-translate-y-1"
                >
                  <ProductCard
                    product={product}
                    categorySlug={categorySlug}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onQuotationRequest={handleQuotationRequest}
        onClearCart={handleClearCart}
      />

      {showQuotationForm && (
        <QuotationForm
          onClose={() => setShowQuotationForm(false)}
          onSuccess={() => {
            setShowQuotationForm(false);
            setShowCart(false);
          }}
        />
      )}

      {addMessage && <Toast message={addMessage} />}
    </div>
  );
};

export default CategoryProducts;