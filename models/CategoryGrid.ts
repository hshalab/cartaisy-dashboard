import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryGrid extends Document {
  storeId: string;
  imageUrl: string;
  title: string;
  collectionId: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryGridSchema = new Schema<ICategoryGrid>(
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
    title: {
      type: String,
      required: true,
      maxlength: 50,
    },
    collectionId: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by store and position
CategoryGridSchema.index({ storeId: 1, position: 1 });
CategoryGridSchema.index({ storeId: 1, isActive: 1 });

export const CategoryGrid =
  mongoose.models.CategoryGrid || mongoose.model<ICategoryGrid>('CategoryGrid', CategoryGridSchema);
