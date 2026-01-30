import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      maxlength: 100,
    },
    subject: {
      type: String,
      default: 'General Inquiry',
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
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

ContactSubmissionSchema.index({ createdAt: -1 });
ContactSubmissionSchema.index({ email: 1 });

export const ContactSubmission: Model<IContactSubmission> =
  mongoose.models.ContactSubmission ||
  mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
