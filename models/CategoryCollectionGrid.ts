import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollectionItem {
  image: string;
  title: string;
  collectionId: string;
}

export interface ICategoryCollectionGrid extends Document {
  storeId: string;
  title: string;
  subtitle: string;
  collections: ICollectionItem[];
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionItemSchema = new Schema<ICollectionItem>(
  {
    image: {
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
  },
  { _id: false }
);

const CategoryCollectionGridSchema = new Schema<ICategoryCollectionGrid>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
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
    collections: {
      type: [CollectionItemSchema],
      required: true,
      validate: {
        validator: function (v: ICollectionItem[]) {
          return v && v.length >= 1;
        },
        message: 'At least one collection is required',
      },
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

// Compound index for efficient queries
CategoryCollectionGridSchema.index({ storeId: 1, position: 1 });
CategoryCollectionGridSchema.index({ storeId: 1, isActive: 1, position: 1 });

export const CategoryCollectionGrid: Model<ICategoryCollectionGrid> =
  mongoose.models.CategoryCollectionGrid ||
  mongoose.model<ICategoryCollectionGrid>('CategoryCollectionGrid', CategoryCollectionGridSchema);
