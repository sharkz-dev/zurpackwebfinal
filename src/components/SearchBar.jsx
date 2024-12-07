// SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const SearchBar = () => {
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
 const [results, setResults] = useState([]);
 const [isLoading, setIsLoading] = useState(false);
 const [showResults, setShowResults] = useState(false);
 const searchRef = useRef(null);
 const { categories, loading: categoriesLoading } = useCategories();

 useEffect(() => {
   const handleClickOutside = (event) => {
     if (searchRef.current && !searchRef.current.contains(event.target)) {
       setShowResults(false);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
   const searchProducts = async () => {
     if (searchTerm.length < 1) {
       setResults([]);
       return;
     }

     setIsLoading(true);
     try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/search?name=${searchTerm}&category=${selectedCategory}`
      );
       if (!response.ok) throw new Error('Error en la búsqueda');
       const data = await response.json();
       setResults(data);
     } catch (error) {
       console.error('Error searching products:', error);
     } finally {
       setIsLoading(false);
     }
   };

   const timeoutId = setTimeout(searchProducts, 300);
   return () => clearTimeout(timeoutId);
 }, [searchTerm, selectedCategory]);

 return (
   <div className="relative w-full max-w-xl mx-auto" ref={searchRef}>
     <div className="flex flex-col sm:flex-row gap-2">
       <div className="relative flex-1">
         <input
           type="text"
           value={searchTerm}
           onChange={(e) => {
             setSearchTerm(e.target.value);
             setShowResults(true);
           }}
           placeholder="¿Qué estás buscando?"
           className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
         />
         {searchTerm && (
           <button
             onClick={() => {
               setSearchTerm('');
               setResults([]);
             }}
             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
           >
             <X className="w-5 h-5" />
           </button>
         )}
       </div>

       <select
         value={selectedCategory}
         onChange={(e) => setSelectedCategory(e.target.value)}
         className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
         disabled={categoriesLoading}
       >
         <option value="">Todas las categorías</option>
         {categories?.map((category) => (
           <option key={category._id} value={category.slug}>
             {category.name}
           </option>
         ))}
       </select>
     </div>

     {/* Resultados */}
     {showResults && (searchTerm.length >= 2 || results.length > 0) && (
       <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
         {isLoading ? (
           <div className="p-4 text-center text-gray-500">Buscando...</div>
         ) : results.length > 0 ? (
           <>
             {results.map((product) => (
               <Link
                 key={product._id}
                 to={`/catalogo/${product.category.slug}/${product.slug}`}
                 className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b last:border-b-0"
                 onClick={() => {
                   setShowResults(false);
                   setSearchTerm('');
                 }}
               >
                 <img
                   src={product.imageUrl}
                   alt={product.name}
                   className="w-12 h-12 object-cover rounded"
                 />
                 <div>
                   <h3 className="font-medium text-gray-900">{product.name}</h3>
                   <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                 </div>
               </Link>
             ))}
             <div className="p-3 bg-gray-50 text-center">
               <span className="text-sm text-gray-500">
                 {results.length} Resultados
               </span>
             </div>
           </>
         ) : searchTerm.length >= 2 ? (
           <div className="p-4 text-center text-gray-500">
             No se encontraron resultados
           </div>
         ) : null}
       </div>
     )}
   </div>
 );
};

export default SearchBar;