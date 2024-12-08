import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import ImageCarousel from '../components/ImageCarousel';
import QuotationForm from '../components/QuotationForm';
import Advertisement from '../components/Advertisement';
import CartDrawer from '../components/CartDrawer';
import Toast from '../components/Toast';
import { ALL_PRODUCTS_CATEGORY } from '../constants/categories';

const CategoryCard = ({ category, index }) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsInView(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      to={`/catalogo/${category.slug}`}
      className={`relative block w-full group transform transition-all duration-500 ${
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="relative w-full pb-[150%] overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Imagen de fondo con gradiente */}
        <div className="absolute inset-0">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="transform group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-green-500/40 backdrop-blur-sm w-full py-2 px-3 sm:px-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                {category.name}
              </h3>
            </div>
            <div className="p-3 sm:p-6">
              <div className="flex items-center text-green-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Ver productos</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Catalog = ({ showCart, setShowCart }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { categories, loading, error } = useCategories();
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

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
          <p className="text-gray-600 font-medium">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {error}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Anuncio destacado */}
      <Advertisement />
      
      {/* Carrusel de imágenes */}
      <div className="mb-12">
        <ImageCarousel />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sección de Categorías */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 relative inline-block">
              Nuestras Categorías
            </h1>
            <div className="h-1 w-24 bg-green-500 mx-auto rounded-full" />
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia selección de productos de alta calidad
            </p>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-lg">
              <div className="max-w-sm mx-auto">
                <p className="text-gray-500 text-lg">
                  No hay categorías disponibles en este momento
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {/* Categoría "Todos los productos" al inicio */}
              <CategoryCard category={ALL_PRODUCTS_CATEGORY} index={0} />
              
              {/* Resto de categorías */}
              {categories.map((category, index) => (
                <CategoryCard 
                  key={category._id} 
                  category={category} 
                  index={index + 1}
                />
              ))}
            </div>
          )}
        </div>
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

export default Catalog;