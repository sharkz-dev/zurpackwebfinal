import Category from '../models/Category.js';
import { v2 as cloudinary } from 'cloudinary';

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener categoría por slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, active: true });
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear categoría
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file ? await uploadImage(req.file) : null;

    const category = new Category({
      name,
      description,
      imageUrl,
      active: true
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;
    const updateData = { name, description, active };

    if (req.file) {
      updateData.imageUrl = await uploadImage(req.file);
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar categoría (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    category.active = false;
    await category.save();

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función auxiliar para subir imágenes
const uploadImage = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    folder: 'categories'
  });
  return result.secure_url;
};