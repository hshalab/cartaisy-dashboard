import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  ipAddress?: string;
  createdAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    ipAddress: {
      type: String,
      maxlength: 50,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', NewsletterSubscriberSchema);
