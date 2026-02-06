import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  status: 'Active' | 'Inactive' | 'Resigned';
  totalDeviceChecks: number;
  lastCheckDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  updateCheckStats(): Promise<void>;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    fullName: {
      type: String,
      index: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Resigned'],
      default: 'Active',
      index: true,
    },
    totalDeviceChecks: {
      type: Number,
      default: 0,
    },
    lastCheckDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate fullName
EmployeeSchema.pre('save', async function () {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }
});

// Method to update statistics
EmployeeSchema.methods.updateCheckStats = async function () {
  const DeviceCheck = mongoose.model('DeviceCheck');
  
  const checkCount = await DeviceCheck.countDocuments({ 
    employeeId: this._id 
  });
  
  const lastCheck = await DeviceCheck.findOne({ 
    employeeId: this._id 
  })
    .sort({ checkDate: -1 })
    .select('checkDate');
  
  this.totalDeviceChecks = checkCount;
  this.lastCheckDate = lastCheck?.checkDate;
  await this.markModified('totalDeviceChecks');
  await this.markModified('lastCheckDate');
  await this.save({ validateBeforeSave: false });
};

// Indexes for performance
EmployeeSchema.index({ fullName: 'text' });
EmployeeSchema.index({ firstName: 1, lastName: 1 });
EmployeeSchema.index({ department: 1, status: 1 });
EmployeeSchema.index({ status: 1 });

const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;