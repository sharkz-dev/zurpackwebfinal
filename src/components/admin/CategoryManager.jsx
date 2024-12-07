// components/admin/CategoryManager.jsx
import React, { useState, memo } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const CategoryForm = ({ 
  category = null, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(category?.imageUrl);
  const [validation, setValidation] = useState({
    name: true,
    description: true,
    image: true
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newValidation = {
      name: !!formData.name.trim(),
      description: !!formData.description.trim(),
      image: !!(category?.imageUrl || formData.image)
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
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 ${
            !validation.name ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {!validation.name && (
          <p className="text-red-500 text-sm mt-1">El nombre es requerido</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows="3"
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 ${
            !validation.description ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {!validation.description && (
          <p className="text-red-500 text-sm mt-1">La descripción es requerida</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen {!category && '*'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required={!category}
        />
        {imagePreview && (
          <div className="mt-2 relative w-32 h-32">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {category ? 'Actualizar' : 'Crear'} Categoría
        </button>
      </div>
    </form>
  );
};

const CategoryManager = ({
  categories = [],
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await onUpdate(editingCategory._id, formData);
      } else {
        await onCreate(formData);
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error al procesar categoría:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {categories.map(category => (
          <div
            key={category._id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow flex items-center gap-4"
          >
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-lg">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setShowForm(true);
                }}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
                    onDelete(category._id);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;