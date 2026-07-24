import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppUser extends Document {
  externalUserId: string;
  attendanceUserId?: string;
  employeeId?: mongoose.Types.ObjectId;
  employeeNo?: string;
  name: string;
  email?: string;
  departmentName?: string;
  jobTitle?: string;
  isActive: boolean;
  role: 'admin' | 'pic' | 'viewer';
  accessScopes: string[];
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppUserSchema = new Schema<IAppUser>({
  externalUserId: { type: String, required: true, unique: true, index: true },
  attendanceUserId: { type: String, trim: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
  employeeNo: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  departmentName: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['admin', 'pic', 'viewer'], default: 'viewer', index: true },
  accessScopes: { type: [String], default: ['devicechecking'], index: true },
  lastSyncedAt: { type: Date },
}, { timestamps: true });

const AppUser: Model<IAppUser> = mongoose.models.AppUser || mongoose.model<IAppUser>('AppUser', AppUserSchema);
export default AppUser;
