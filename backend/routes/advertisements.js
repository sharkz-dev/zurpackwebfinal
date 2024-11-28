import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Advertisement from '../models/advertisement.js';

const router = express.Router();

// Obtener todos los anuncios (protegida - admin)
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo todos los anuncios...');
    const advertisements = await Advertisement.find({})
      .sort('-createdAt');
    
    console.log(`Anuncios encontrados: ${advertisements.length}`);
    res.json(advertisements);
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    res.status(500).json({ 
      message: 'Error al obtener anuncios',
      error: error.message 
    });
  }
});

// Obtener anuncio activo (pública)
router.get('/active', async (req, res) => {
  try {
    console.log('Buscando anuncio activo...');
    const advertisement = await Advertisement.findOne({ isActive: true })
      .sort('-createdAt');
    
    console.log('Anuncio activo encontrado:', advertisement ? 'Sí' : 'No');
    res.json(advertisement);
  } catch (error) {
    console.error('Error al obtener anuncio activo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Crear anuncio (protegida - admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    console.log('Creando nuevo anuncio:', req.body);

    const { text, backgroundColor, textColor, isActive } = req.body;
    
    // Si hay un anuncio activo y este nuevo anuncio será activo, desactivar el actual
    if (isActive) {
      await Advertisement.updateMany({}, { isActive: false });
    }
    
    const advertisement = new Advertisement({
      text,
      backgroundColor: backgroundColor || '#000000',
      textColor: textColor || '#FFFFFF',
      isActive: isActive || false
    });

    const savedAdvertisement = await advertisement.save();
    console.log('Anuncio creado:', savedAdvertisement);
    
    res.status(201).json(savedAdvertisement);
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    res.status(400).json({ 
      message: 'Error al crear el anuncio',
      error: error.message 
    });
  }
});

// Actualizar anuncio (protegida - admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    console.log('Actualizando anuncio:', req.params.id);
    console.log('Datos de actualización:', req.body);

    const { text, backgroundColor, textColor, isActive } = req.body;
    
    // Si este anuncio será activo, desactivar todos los demás
    if (isActive) {
      await Advertisement.updateMany(
        { _id: { $ne: req.params.id } }, 
        { isActive: false }
      );
    }
    
    const advertisement = await Advertisement.findById(req.params.id);
    
    if (!advertisement) {
      console.log('Anuncio no encontrado');
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    advertisement.text = text;
    advertisement.backgroundColor = backgroundColor;
    advertisement.textColor = textColor;
    advertisement.isActive = isActive;

    const updatedAdvertisement = await advertisement.save();
    console.log('Anuncio actualizado:', updatedAdvertisement);
    
    res.json(updatedAdvertisement);
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    res.status(400).json({ message: error.message });
  }
});

// Eliminar anuncio (protegida - admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    console.log('Eliminando anuncio:', req.params.id);
    
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    await Advertisement.findByIdAndDelete(req.params.id);
    console.log('Anuncio eliminado correctamente');
    
    res.json({ message: 'Anuncio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    res.status(500).json({ message: 'Error al eliminar el anuncio' });
  }
});

// Toggle estado activo (protegida - admin)
router.put('/:id/toggle', protect, admin, async (req, res) => {
  try {
    console.log('Cambiando estado de anuncio:', req.params.id);
    
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Anuncio no encontrado' });
    }

    // Cambiar el estado actual
    advertisement.isActive = !advertisement.isActive;

    // Si se está activando, desactivar todos los demás
    if (advertisement.isActive) {
      await Advertisement.updateMany(
        { _id: { $ne: req.params.id } },
        { isActive: false }
      );
    }

    await advertisement.save();

    console.log(`Anuncio ${advertisement.isActive ? 'activado' : 'desactivado'}`);
    res.json(advertisement);
  } catch (error) {
    console.error('Error al cambiar estado del anuncio:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;