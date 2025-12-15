import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollectionDisplay extends Document {
  storeId: string;
  type: 'large_row' | 'small_grid' | 'medium_row';
  collectionId: string;
  title?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionDisplaySchema = new Schema<ICollectionDisplay>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['large_row', 'small_grid', 'medium_row'],
      required: true,
    },
    collectionId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    order: {
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

// Compound index for efficient queries
CollectionDisplaySchema.index({ storeId: 1, order: 1 });
CollectionDisplaySchema.index({ storeId: 1, isActive: 1, order: 1 });

export const CollectionDisplay: Model<ICollectionDisplay> =
  mongoose.models.CollectionDisplay ||
  mongoose.model<ICollectionDisplay>('CollectionDisplay', CollectionDisplaySchema);
