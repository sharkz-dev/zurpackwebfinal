import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js';
import Category from '../models/Category.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configurar Cloudinary (usar la misma configuración que ya tienes)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener categoría por slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      active: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ message: error.message });
  }
});

// Crear categoría
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere una imagen' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'categorias'
    });

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      imageUrl: uploadResponse.secure_url,
      active: true
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(400).json({ message: error.message });
  }
});

// Actualizar categoría
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description
    };

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'categorias'
      });
      updateData.imageUrl = uploadResponse.secure_url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(400).json({ message: error.message });
  }
});

// Eliminar categoría (soft delete)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    category.active = false;
    await category.save();
    
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;