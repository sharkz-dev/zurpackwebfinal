import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Package, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import QuotationForm from '../components/QuotationForm';
import Toast from '../components/Toast';

const ProductDetailPage = ({ showCart, setShowCart }) => {
  const { categorySlug, productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  const { addToCart, cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/by-slug/${productSlug}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el producto');
        }
        
        const data = await response.json();
        
        if (data.category?.slug !== categorySlug) {
          throw new Error('Producto no encontrado en esta categoría');
        }
        
        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, categorySlug]);

  const handleAddToCart = () => {
    if (product.hasSizeVariants && !selectedSize) {
      setAddMessage('Por favor seleccione una variante');
      const selectElement = document.querySelector('select');
      if (selectElement) {
        selectElement.focus();
      }
      setTimeout(() => setAddMessage(null), 3000);
      return;
    }

    addToCart({
      ...product,
      selectedSize,
      quantity
    });

    setAddMessage('Producto añadido a la cotización');
    setTimeout(() => setAddMessage(null), 3000);
  };

  const handleQuotationRequest = () => {
    setShowCart(false);
    setShowQuotationForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
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
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Producto no encontrado'}
          </h2>
          <button
            onClick={() => navigate(`/catalogo/${categorySlug}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la categoría
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <button
            onClick={() => navigate(`/catalogo/${categorySlug}`)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a {product.category?.name}</span>
          </button>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Imagen del producto */}
            <div className="relative p-6 flex items-center justify-center bg-gray-50">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="p-8 lg:p-12">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {product.category?.name}
                  </span>
                  {product.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Destacado
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600">
                  {product.description}
                </p>
              </div>

              {/* Selector de variante */}
              {product.hasSizeVariants && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variantes
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Variantes</option>
                    {product.sizeVariants
                      .filter(variant => variant.isAvailable)
                      .map(variant => (
                        <option key={variant.size} value={variant.size}>
                          {variant.size}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              {/* Control de cantidad */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center gap-3 text-lg font-medium"
              >
                <ShoppingCart className="w-6 h-6" />
                Añadir a la cotización
              </button>

              {/* Características adicionales */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Box className="w-5 h-5" />
                    <span>Envíos a todo Chile</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Package className="w-5 h-5" />
                    <span>Producto de calidad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onQuotationRequest={handleQuotationRequest}
        onClearCart={clearCart}
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

export default ProductDetailPage;