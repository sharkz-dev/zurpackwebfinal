import { useState, useCallback } from 'react';

export const useAdminAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/advertisements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los anuncios');
      }

      const data = await response.json();
      console.log('Anuncios cargados:', data);
      setAdvertisements(data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdvertisement = useCallback(async (adData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/advertisements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el anuncio');
      }

      await fetchAdvertisements();
      return true;
    } catch (error) {
      console.error('Error creating advertisement:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAdvertisements]);

  const updateAdvertisement = useCallback(async (id, adData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/advertisements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el anuncio');
      }

      await fetchAdvertisements();
      return true;
    } catch (error) {
      console.error('Error updating advertisement:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAdvertisements]);

  const deleteAdvertisement = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
      return false;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/advertisements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el anuncio');
      }

      await fetchAdvertisements();
      return true;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAdvertisements]);

  const toggleAdvertisement = useCallback(async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/advertisements/${id}/toggle`, {
        method: 'PUT', // Cambiado de PATCH a PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar el estado del anuncio');
      }

      await fetchAdvertisements();
      return true;
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAdvertisements]);

  return {
    advertisements,
    loading,
    error,
    fetchAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisement
  };
};