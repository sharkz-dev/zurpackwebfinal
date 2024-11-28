import React, { useState, useEffect, memo } from 'react';
import { Loader } from 'lucide-react';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useCategories } from '../hooks/useCategories';
import { useAdminAdvertisements } from '../hooks/useAdminAdvertisements';
import ProductTable from '../components/admin/ProductTable';
import ProductForm from '../components/admin/ProductForm';
import CategoryManager from '../components/admin/CategoryManager';
import AdvertisementManager from '../components/admin/AdvertisementManager';
import Toast from '../components/Toast';

const StatusMessage = memo(({ type, message }) => (
  <div className={`p-4 mb-6 rounded-lg animate-fade-in-up ${
    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  }`}>
    {message}
  </div>
));

const Section = memo(({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
    <h2 className="text-xl font-semibold mb-4 sm:mb-6">{title}</h2>
    {children}
  </div>
));

const Tabs = memo(({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'products', label: 'Productos' },
    { id: 'categories', label: 'Categorías' },
    { id: 'advertisements', label: 'Anuncios' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [dataCache, setDataCache] = useState({
    products: null,
    categories: null,
    advertisements: null,
    lastFetch: null
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: null,
    featured: false,
    hasSizeVariants: true,
    sizeVariants: []
  });

  const {
    products,
    loading: productsLoading,
    error: productsError,
    imagePreview,
    fetchProducts,
    handleImageChange,
    createProduct,
    updateProduct,
    deleteProduct,
    setImagePreview
  } = useAdminProducts();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories();

  const {
    advertisements,
    loading: adsLoading,
    error: adsError,
    fetchAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    toggleAdvertisement
  } = useAdminAdvertisements();

  useEffect(() => {
    let isMounted = true;
  
    const loadData = async () => {
      try {
        setIsLoading(true);
        setGlobalError(null);
  
        // Esperar un pequeño delay para asegurar que el token esté disponible
        await new Promise(resolve => setTimeout(resolve, 500));
  
        if (!isMounted) return;
  
        // Realizar las llamadas secuencialmente
        try {
          await fetchProducts();
        } catch (error) {
          console.error('Error loading products:', error);
        }
  
        if (!isMounted) return;
  
        try {
          await fetchCategories();
        } catch (error) {
          console.error('Error loading categories:', error);
        }
  
        if (!isMounted) return;
  
        try {
          await fetchAdvertisements();
        } catch (error) {
          console.error('Error loading advertisements:', error);
        }
  
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          setGlobalError('Error al cargar los datos. Por favor, recarga la página.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
  
    loadData();
  
    return () => {
      isMounted = false;
    };
  }, []);

  const showMessage = (message, type = 'success') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      image: null,
      featured: false,
      hasSizeVariants: true,
      sizeVariants: []
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const handleProductSubmit = async (submitData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, submitData);
        showMessage('Producto actualizado correctamente');
      } else {
        await createProduct(submitData);
        showMessage('Producto creado correctamente');
      }
      resetForm();
      await fetchProducts();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category?._id || '',
      featured: product.featured,
      hasSizeVariants: true,
      sizeVariants: product.sizeVariants || [],
      image: null
    });
    setImagePreview(product.imageUrl);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        showMessage('Producto eliminado correctamente');
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div className="text-center">
          <Loader className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Panel de Administración
        </h1>

        {globalError && <StatusMessage type="error" message={globalError} />}
        {statusMessage && (
          <StatusMessage type={statusMessage.type} message={statusMessage.message} />
        )}

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'products' && (
          <>
            <Section title={editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}>
              <ProductForm
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                onSubmit={handleProductSubmit}
                onCancel={editingProduct ? resetForm : undefined}
                isEditing={!!editingProduct}
                categories={categories}
                onImageChange={(e) => {
                  const file = handleImageChange(e.target.files[0]);
                  setFormData(prev => ({ ...prev, image: file }));
                }}
              />
            </Section>

            <Section title="Productos Existentes">
              <ProductTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </Section>
          </>
        )}

        {activeTab === 'categories' && (
          <Section title="Gestión de Categorías">
            <CategoryManager
              categories={categories}
              onCreate={createCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          </Section>
        )}

        {activeTab === 'advertisements' && (
          <Section title="Gestión de Anuncios">
            <AdvertisementManager
              advertisements={advertisements}
              onCreateAd={createAdvertisement}
              onUpdateAd={updateAdvertisement}
              onDeleteAd={deleteAdvertisement}
              onToggleActive={toggleAdvertisement}
            />
          </Section>
        )}

        {statusMessage && <Toast message={statusMessage.message} />}
      </div>
    </div>
  );
};

export default memo(Admin);