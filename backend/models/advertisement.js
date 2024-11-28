import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'El texto del anuncio es requerido']
  },
  backgroundColor: {
    type: String,
    default: '#000000'
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Asegurar que solo hay un anuncio activo
advertisementSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement;