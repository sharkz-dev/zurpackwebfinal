import React, { memo, useState, useMemo } from 'react';
import { Pencil, Trash2, Star, Search } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm hover:shadow p-4">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Imagen del producto */}
      <div className="w-full sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              {product.featured && (
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {product.category ? product.category.name : 'Sin categoría'}
            </p>
          </div>
          <div className="flex gap-2 self-end sm:self-start">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg flex items-center gap-1"
              title="Editar"
            >
              <Pencil className="w-5 h-5" />
              <span className="text-sm sm:hidden">Editar</span>
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm sm:hidden">Eliminar</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>

        {/* Variantes */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.sizeVariants?.map((variant, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-xs ${
                variant.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {variant.size}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductTable = ({ products = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      (product.category?.name || '').toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ProductTable);