import mongoose, { Schema } from 'mongoose';

const ApartmentSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  units: { type: Number, default: 0 },
  residents: { type: Number, default: 0 },
  vehicles: { type: Number, default: 0 },
  staff: { type: Number, default: 0 },
  mrr: { type: Number, default: 0 },
  complaints: { type: Number, default: 0 },
  occupancy: { type: Number, default: 0 },
});

export const ApartmentModel = mongoose.models.Apartment || mongoose.model('Apartment', ApartmentSchema);
