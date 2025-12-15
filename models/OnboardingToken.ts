import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingToken extends Document {
  token: string;
  email: string;
  storeName?: string;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
  createdBy: string;
  notes?: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

const OnboardingTokenSchema = new Schema<IOnboardingToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    storeName: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'used', 'expired', 'revoked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const OnboardingToken = mongoose.models.OnboardingToken ||
  mongoose.model<IOnboardingToken>('OnboardingToken', OnboardingTokenSchema);
