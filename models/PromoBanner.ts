import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromoBanner extends Document {
  storeId: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  collectionId: string;
  position: number;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromoBannerSchema = new Schema<IPromoBanner>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    subtitle: {
      type: String,
      required: true,
      maxlength: 200,
    },
    ctaText: {
      type: String,
      required: true,
      maxlength: 30,
    },
    collectionId: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    buttonColor: {
      type: String,
      default: '#007bff',
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
PromoBannerSchema.index({ storeId: 1, position: 1 });
PromoBannerSchema.index({ storeId: 1, isActive: 1, position: 1 });

export const PromoBanner: Model<IPromoBanner> =
  mongoose.models.PromoBanner ||
  mongoose.model<IPromoBanner>('PromoBanner', PromoBannerSchema);
