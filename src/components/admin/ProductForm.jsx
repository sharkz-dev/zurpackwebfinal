import React, { memo, useState, useEffect } from 'react';
import { Star, Plus, X } from 'lucide-react';

const SizeVariantsManager = memo(({ variants = [], setVariants }) => {
  const [newSize, setNewSize] = useState('');

  const addVariant = () => {
    if (newSize.trim()) {
      setVariants([...variants, { size: newSize, isAvailable: true }]);
      setNewSize('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
          placeholder="Ej: 30x30 cm"
          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={addVariant}
          className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
            <span className="flex-1">{variant.size}</span>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                const newVariants = [...variants];
                newVariants[index].isAvailable = !newVariants[index].isAvailable;
                setVariants(newVariants);
              }}
            >
              {variant.isAvailable ? 'Disponible' : 'No disponible'}
            </button>
            <button
              type="button"
              onClick={() => setVariants(variants.filter((_, i) => i !== index))}
              className="p-1 text-red-500 hover:bg-red-50 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

const ProductForm = ({
  formData,
  setFormData,
  imagePreview,
  onSubmit,
  onCancel,
  isEditing = false,
  categories = [],
  onImageChange
}) => {
  const [validation, setValidation] = useState({
    name: true,
    category: true,
    description: true,
    sizeVariants: true
  });

  const validateForm = () => {
    const newValidation = {
      name: !!formData.name.trim(),
      category: !!formData.category,
      description: !!formData.description.trim(),
      sizeVariants: formData.sizeVariants.length > 0
    };
    
    setValidation(newValidation);
    return Object.values(newValidation).every(v => v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('featured', formData.featured);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    submitData.append('hasSizeVariants', 'true');
    submitData.append('sizeVariants', JSON.stringify(formData.sizeVariants));

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 ${
              !validation.name ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {!validation.name && (
            <p className="text-red-500 text-sm mt-1">El nombre es requerido</p>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 ${
              !validation.category ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {!validation.category && (
            <p className="text-red-500 text-sm mt-1">Debe seleccionar una categoría</p>
          )}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 ${
              !validation.description ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {!validation.description && (
            <p className="text-red-500 text-sm mt-1">La descripción es requerida</p>
          )}
        </div>

        {/* Imagen */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen {!isEditing && '*'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e)}
            className="w-full"
            required={!isEditing}
          />
          {imagePreview && (
            <div className="mt-2 relative w-32 h-32">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Variantes de tamaño */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variantes de tamaño *
          </label>
          <SizeVariantsManager
            variants={formData.sizeVariants}
            setVariants={(newVariants) => 
              setFormData(prev => ({ ...prev, sizeVariants: newVariants }))
            }
          />
          {!validation.sizeVariants && (
            <p className="text-red-500 text-sm mt-1">
              Debe agregar al menos una variante
            </p>
          )}
        </div>

        {/* Producto destacado */}
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                featured: e.target.checked 
              }))}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              Marcar como destacado
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Los productos destacados aparecerán en la página principal
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <span>Guardar Cambios</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Crear Producto</span>
            </>
          )}
        </button>
      </div>

      {/* Toast de error de validación */}
      {Object.values(validation).some(v => !v) && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          <p className="font-medium">Por favor, complete todos los campos requeridos</p>
        </div>
      )}
    </form>
  );
};

export default memo(ProductForm)