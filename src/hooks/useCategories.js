import { useState, useEffect } from 'react';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las categorías');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar las categorías. Por favor, intente nuevamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories().catch(error => {
      console.error('Error en useEffect:', error);
    });
  }, []);

  const createCategory = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};