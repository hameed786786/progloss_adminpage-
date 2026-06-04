import mongoose, { Schema } from 'mongoose';

const EcommerceProductSchema = new Schema({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
});

export const EcommerceProductModel =
  mongoose.models.EcommerceProduct || mongoose.model('EcommerceProduct', EcommerceProductSchema);
