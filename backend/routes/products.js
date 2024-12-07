import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para obtener el public_id de una URL de Cloudinary
const getPublicIdFromUrl = (url) => {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    return `${folderName}/${filename.split('.')[0]}`;
  } catch (error) {
    console.error('Error extrayendo public_id:', error);
    return null;
  }
};

// Obtener todos los productos (ruta pública)
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo todos los productos...');

    const products = await Product.find({})
      .populate({
        path: 'category',
        select: 'name slug',
        match: { active: true }
      })
      .sort({ createdAt: -1 });

    // Filtrar productos donde la categoría existe y está activa
    const filteredProducts = products.filter(product => product.category);
    
    console.log(`Productos encontrados: ${filteredProducts.length}`);
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obtener productos destacados
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate({
        path: 'category',
        select: 'name slug',
        match: { active: true }
      })
      .sort('-createdAt');

    const filteredProducts = products.filter(product => product.category);
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener productos por categoría
router.get('/by-category/:categorySlug', async (req, res) => {
  try {
    console.log('Buscando productos para categoría:', req.params.categorySlug);
    
    const category = await Category.findOne({ 
      slug: req.params.categorySlug,
      active: true 
    });
    
    if (!category) {
      console.log('Categoría no encontrada');
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    console.log('Categoría encontrada:', category.name);

    const products = await Product.find({ category: category._id })
      .populate({
        path: 'category',
        select: 'name slug'
      })
      .sort('-createdAt');

    console.log(`Productos encontrados: ${products.length}`);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener un producto por slug (ruta pública)
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate({
        path: 'category',
        select: 'name slug'
      });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: error.message });
  }
});

// Crear producto (protegida)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Iniciando creación de producto...');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se ha proporcionado una imagen',
        details: 'El campo image es requerido'
      });
    }

    // Validaciones
    if (!req.body.name) {
      return res.status(400).json({ 
        message: 'El nombre es requerido',
        field: 'name'
      });
    }

    if (!req.body.description) {
      return res.status(400).json({ 
        message: 'La descripción es requerida',
        field: 'description'
      });
    }

    if (!req.body.category) {
      return res.status(400).json({ 
        message: 'La categoría es requerida',
        field: 'category'
      });
    }

    // Verificar que la categoría existe
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ 
        message: 'La categoría seleccionada no existe',
        field: 'category'
      });
    }

    let sizeVariants = [];
    if (req.body.sizeVariants) {
      try {
        sizeVariants = JSON.parse(req.body.sizeVariants);
        console.log('SizeVariants parseados:', sizeVariants);
      } catch (error) {
        console.error('Error parseando sizeVariants:', error);
        return res.status(400).json({ 
          message: 'Error en el formato de sizeVariants',
          details: error.message
        });
      }
    }

    // Subir imagen a Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    console.log('Subiendo imagen a Cloudinary...');
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'productos'
    });

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      imageUrl: uploadResponse.secure_url,
      featured: req.body.featured === 'true',
      hasSizeVariants: true,
      sizeVariants: sizeVariants
    });

    console.log('Guardando producto en la base de datos...');
    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name slug');
    
    console.log('Producto guardado exitosamente:', populatedProduct);
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : [],
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Actualizar producto (protegida)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Actualizando producto:', req.params.id);
    console.log('Datos de actualización:', req.body);

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      featured: req.body.featured === 'true',
      hasSizeVariants: req.body.hasSizeVariants === 'true',
      sizeVariants: req.body.sizeVariants ? JSON.parse(req.body.sizeVariants) : []
    };

    // Verificar que la categoría existe
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return res.status(400).json({ message: 'La categoría seleccionada no existe' });
      }
    }

    if (req.file) {
      const currentProduct = await Product.findById(req.params.id);
      if (currentProduct && currentProduct.imageUrl) {
        const publicId = getPublicIdFromUrl(currentProduct.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error('Error al eliminar imagen anterior:', error);
          }
        }
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'productos'
      });
      updateData.imageUrl = uploadResponse.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('category', 'name slug');

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log('Producto actualizado:', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(400).json({ message: error.message });
  }
});

// Eliminar producto (protegida)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const publicId = getPublicIdFromUrl(product.imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error eliminando imagen de Cloudinary:', cloudinaryError);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error en la eliminación:', error);
    res.status(500).json({ message: error.message });
  }
});

//Buscar productos
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query;
    
    if (!name || name.length < 1) {
      return res.json([]);
    }

    let categoryQuery = {};
    if (category) {
      const categoryObj = await Category.findOne({ 
        slug: category,
        active: true 
      });
      if (categoryObj) {
        categoryQuery.category = categoryObj._id;
      }
    }

    // Buscar coincidencias usando el regex para subcadena continua
    const products = await Product.find({
      name: { $regex: name, $options: 'i' },
      ...categoryQuery
    })
    .populate({
      path: 'category',
      select: 'name slug',
      match: { active: true }
    })
    .sort('-createdAt')
    .limit(10);

    const filteredProducts = products.filter(product => product.category);
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;