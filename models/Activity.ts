import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  storeId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  resourceType: 'carousel' | 'category_grid' | 'callout_banner' | 'collection_display' | 'promo_banner' | 'category_collection_grid' | 'collection_showcase' | 'store_settings' | 'team_member' | 'shopify_connection' | 'home_layout';
  resourceId: string;
  resourceName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'activate', 'deactivate'],
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        'carousel',
        'category_grid',
        'callout_banner',
        'collection_display',
        'promo_banner',
        'category_collection_grid',
        'collection_showcase',
        'store_settings',
        'team_member',
        'shopify_connection',
        'home_layout',
      ],
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    resourceName: {
      type: String,
      maxlength: 200,
    },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      maxlength: 50,
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for efficient queries
ActivitySchema.index({ storeId: 1, createdAt: -1 });
ActivitySchema.index({ storeId: 1, userId: 1, createdAt: -1 });
ActivitySchema.index({ storeId: 1, resourceType: 1, createdAt: -1 });
ActivitySchema.index({ storeId: 1, resourceType: 1, resourceId: 1 });

// TTL index to auto-delete activities older than 90 days (configurable)
// ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
