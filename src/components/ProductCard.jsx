import React, { memo, useState } from 'react';
import { Star, Plus, Minus, ShoppingCart, AlertCircle, Share2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({
  product,
  categorySlug,
  onImageClick,
  showAddToCart = true
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [localSelectedSize, setLocalSelectedSize] = useState('');
  const [localQuantity, setLocalQuantity] = useState(1);
  const [showError, setShowError] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Validar que product.sizeVariants existe
  const availableSizes = product.sizeVariants?.filter(variant => variant.isAvailable) || [];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.hasSizeVariants && !localSelectedSize) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    addToCart({
      ...product,
      selectedSize: localSelectedSize,
      quantity: localQuantity
    });

    setAddMessage('Producto añadido a la cotización');
    setTimeout(() => setAddMessage(null), 2000);

    // Resetear estados después de añadir al carrito
    setLocalQuantity(1);
    setLocalSelectedSize('');
  };

  const handleQuantityChange = (newQuantity) => {
    setLocalQuantity(Math.max(1, newQuantity));
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/catalogo/${categorySlug}/${product.slug}`;
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setAddMessage('Enlace copiado al portapapeles');
        setTimeout(() => setAddMessage(null), 2000);
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (e.altKey || e.ctrlKey || e.shiftKey) {
      onImageClick && onImageClick(product.imageUrl);
    } else {
      navigate(`/catalogo/${categorySlug}/${product.slug}`);
    }
  };

  return (
    <div 
      className="bg-white border rounded-lg overflow-hidden flex flex-col relative hover:shadow-lg transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mensajes de error o confirmación */}
      {showError && (
        <div className="absolute top-2 left-2 right-2 z-20 animate-fade-in-up">
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Por favor seleccione una variante</span>
          </div>
        </div>
      )}

      {addMessage && (
        <div className="absolute top-2 left-2 right-2 z-20 animate-fade-in-up">
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
            {addMessage}
          </div>
        </div>
      )}

      {/* Imagen y badges */}
      <div className="relative group">
        <div 
          className="w-full h-48 sm:h-64 bg-gray-100 overflow-hidden"
          onClick={handleImageClick}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" fill="currentColor" />
            <span>Destacado</span>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            title="Compartir producto"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleImageClick}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Título y categoría */}
        <div className="mb-3">
          <h3 
            className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors cursor-pointer line-clamp-2"
            onClick={() => navigate(`/catalogo/${categorySlug}/${product.slug}`)}
          >
            {product.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {product.category?.name || 'Sin categoría'}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {showAddToCart && (
          <>
            {/* Selector de variante */}
            {product.hasSizeVariants && availableSizes.length > 0 && (
              <div className="mb-3">
                <select
                  value={localSelectedSize}
                  onChange={(e) => setLocalSelectedSize(e.target.value)}
                  className={`w-full p-2 border rounded-lg text-sm ${
                    showError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                >
                  <option value="">Variantes</option>
                  {availableSizes.map(variant => (
                    <option key={variant.size} value={variant.size}>
                      {variant.size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Control de cantidad */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(localQuantity - 1);
                }}
                className="p-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={localQuantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 text-center border rounded-lg p-1 text-sm"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(localQuantity + 1);
                }}
                className="p-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Botón añadir al carrito */}
            <button
              onClick={handleAddToCart}
              className="w-full mt-auto flex items-center justify-center gap-2 py-2 px-4 
                       bg-white border-2 border-green-500 text-green-600 rounded-lg 
                       hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Añadir a cotización
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ProductCard);