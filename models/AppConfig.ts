import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComponent {
  id: string;
  type: string;
  title: string;
  position: number;
  isActive: boolean;
}

export interface IAppConfig extends Document {
  storeId: string;
  components: IComponent[];
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponent>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const AppConfigSchema = new Schema<IAppConfig>(
  {
    storeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    components: {
      type: [ComponentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const AppConfig: Model<IAppConfig> =
  mongoose.models.AppConfig ||
  mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);
