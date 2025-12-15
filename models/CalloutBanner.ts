import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICalloutBannerAction {
  type: 'collection' | 'navigation';
  collectionId?: string;
  navigateTo?: string;
}

export interface ICalloutBanner extends Document {
  storeId: string;
  imageUrl: string;
  title: string;
  subTitle: string;
  buttonText: string;
  action: ICalloutBannerAction;
  position: number;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalloutBannerActionSchema = new Schema<ICalloutBannerAction>({
  type: {
    type: String,
    enum: ['collection', 'navigation'],
    required: true,
  },
  collectionId: {
    type: String,
  },
  navigateTo: {
    type: String,
  },
});

const CalloutBannerSchema = new Schema<ICalloutBanner>(
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
    },
    subTitle: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    action: {
      type: CalloutBannerActionSchema,
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
    backgroundColor: {
      type: String,
    },
    textColor: {
      type: String,
    },
    buttonColor: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
CalloutBannerSchema.index({ storeId: 1, position: 1 });

export const CalloutBanner: Model<ICalloutBanner> =
  mongoose.models.CalloutBanner ||
  mongoose.model<ICalloutBanner>('CalloutBanner', CalloutBannerSchema);
