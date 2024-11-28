import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => (
  <Link 
    to={`/catalogo/${category.slug}`}
    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
  >
    <div className="aspect-w-16 aspect-h-9">
      <img 
        src={category.imageUrl}
        alt={category.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
    </div>
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
      <p className="text-gray-600 mt-2">{category.description}</p>
    </div>
  </Link>
);

const CategoryGrid = ({ categories }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {categories.map(category => (
      <CategoryCard key={category._id} category={category} />
    ))}
  </div>
);

export default CategoryGrid;