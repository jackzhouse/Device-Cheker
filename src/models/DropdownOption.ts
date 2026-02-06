import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDropdownOption extends Document {
  fieldName: string;
  category?: string;
  value: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date;
}

const DropdownOptionSchema = new Schema<IDropdownOption>(
  {
    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    value: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries
DropdownOptionSchema.index({ fieldName: 1, value: 1 }, { unique: true });
DropdownOptionSchema.index({ fieldName: 1, usageCount: -1 });
DropdownOptionSchema.index({ fieldName: 1, category: 1 });

const DropdownOption: Model<IDropdownOption> = mongoose.models.DropdownOption || mongoose.model<IDropdownOption>('DropdownOption', DropdownOptionSchema);

export default DropdownOption;