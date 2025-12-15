import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICarouselItem extends Document {
  storeId: string;
  imageUrl: string;
  label: string;
  title: string;
  subtitle: string;
  ctaText: string;
  collectionId: string;
  endsAt?: Date;
  promoTag?: {
    text?: string;
    imageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarouselItemSchema = new Schema<ICarouselItem>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: 50,
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
      default: 'Shop Now',
      maxlength: 30,
    },
    collectionId: {
      type: String,
      required: true,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    promoTag: {
      text: String,
      imageUrl: String,
      backgroundColor: String,
      textColor: String,
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
  },
  { timestamps: true }
);

// Index for efficient querying
CarouselItemSchema.index({ storeId: 1, isActive: 1, position: 1 });

export const CarouselItem: Model<ICarouselItem> = mongoose.models.CarouselItem ||
  mongoose.model<ICarouselItem>('CarouselItem', CarouselItemSchema);
