import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShowcaseCollectionItem {
  image: string;
  title: string;
  collectionId: string;
}

export interface ICollectionShowcase extends Document {
  storeId: string;
  type: 'grid' | 'circular';
  title: string;
  icon?: string;
  collections: IShowcaseCollectionItem[];
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowcaseCollectionItemSchema = new Schema<IShowcaseCollectionItem>(
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

const CollectionShowcaseSchema = new Schema<ICollectionShowcase>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['grid', 'circular'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    icon: {
      type: String,
      maxlength: 50,
    },
    collections: {
      type: [ShowcaseCollectionItemSchema],
      required: true,
      validate: {
        validator: function (v: IShowcaseCollectionItem[]) {
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
CollectionShowcaseSchema.index({ storeId: 1, position: 1 });
CollectionShowcaseSchema.index({ storeId: 1, isActive: 1, position: 1 });

export const CollectionShowcase: Model<ICollectionShowcase> =
  mongoose.models.CollectionShowcase ||
  mongoose.model<ICollectionShowcase>('CollectionShowcase', CollectionShowcaseSchema);
