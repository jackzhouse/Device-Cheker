import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeviceCheck extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeSnapshot: {
    fullName: string;
    position: string;
    department?: string;
  };
  deviceDetail: {
    deviceType: 'PC' | 'Laptop';
    ownership: 'Company' | 'Personal';
    deviceBrand: string;
    deviceModel: string;
    serialNumber: string;
  };
  operatingSystem: {
    osType: 'Windows' | 'Linux' | 'Mac';
    osVersion: string;
    osLicense: 'Original' | 'Pirated' | 'Open Source' | 'Unknown';
    osRegularUpdate: boolean;
  };
  specification?: {
    ramCapacity?: string;
    memoryType?: 'HDD' | 'SSD';
    memoryCapacity?: string;
    processor?: string;
  };
  deviceCondition: {
    deviceSuitability: 'Suitable' | 'Limited Suitability' | 'Needs Repair' | 'Unsuitable';
    batterySuitability: string;
    keyboardCondition: string;
    touchpadCondition: string;
    monitorCondition: string;
    wifiCondition: string;
  };
  workApplications: Array<{
    applicationName: string;
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  nonWorkApplications: Array<{
    applicationName: string;
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  security: {
    antivirus: {
      status: 'Active' | 'Inactive';
      list: Array<{
        applicationName: string;
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
    vpn: {
      status: 'Available' | 'Not Available';
      list: Array<{
        vpnName: string;
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
  };
  additionalInfo: {
    passwordUsage: 'Available' | 'Not Available';
    otherNotes?: string;
    inspectorPICName?: string;
  };
  checkDate: Date;
  version?: number; // Optional - auto-calculated in pre-save hook
  createdAt: Date;
  updatedAt: Date;
}

const DeviceCheckSchema = new Schema<IDeviceCheck>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
      index: true,
    },
    employeeSnapshot: {
      fullName: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      department: {
        type: String,
      },
    },
    deviceDetail: {
      deviceType: {
        type: String,
        enum: ['PC', 'Laptop'],
        required: [true, 'Device type is required'],
      },
      ownership: {
        type: String,
        enum: ['Company', 'Personal'],
        required: [true, 'Ownership is required'],
      },
      deviceBrand: {
        type: String,
        required: [true, 'Device brand is required'],
        trim: true,
      },
      deviceModel: {
        type: String,
        required: [true, 'Device model is required'],
        trim: true,
      },
      serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        trim: true,
      },
    },
    operatingSystem: {
      osType: {
        type: String,
        enum: ['Windows', 'Linux', 'Mac'],
        required: [true, 'OS type is required'],
      },
      osVersion: {
        type: String,
        required: [true, 'OS version is required'],
        trim: true,
      },
      osLicense: {
        type: String,
        enum: ['Original', 'Pirated', 'Open Source', 'Unknown'],
        required: [true, 'OS license is required'],
      },
      osRegularUpdate: {
        type: Boolean,
        default: false,
      },
    },
    specification: {
      ramCapacity: {
        type: String,
        trim: true,
      },
      memoryType: {
        type: String,
        enum: ['HDD', 'SSD'],
      },
      memoryCapacity: {
        type: String,
        trim: true,
      },
      processor: {
        type: String,
        trim: true,
      },
    },
    deviceCondition: {
      deviceSuitability: {
        type: String,
        enum: ['Suitable', 'Limited Suitability', 'Needs Repair', 'Unsuitable'],
        required: [true, 'Device suitability is required'],
        index: true,
      },
      batterySuitability: {
        type: String,
        required: [true, 'Battery suitability is required'],
        trim: true,
      },
      keyboardCondition: {
        type: String,
        required: [true, 'Keyboard condition is required'],
        trim: true,
      },
      touchpadCondition: {
        type: String,
        required: [true, 'Touchpad condition is required'],
        trim: true,
      },
      monitorCondition: {
        type: String,
        required: [true, 'Monitor condition is required'],
        trim: true,
      },
      wifiCondition: {
        type: String,
        required: [true, 'WiFi condition is required'],
        trim: true,
      },
    },
    workApplications: [{
      applicationName: {
        type: String,
        required: true,
        trim: true,
      },
      license: {
        type: String,
        enum: ['Original', 'Pirated', 'Unknown', 'Open Source'],
        required: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    nonWorkApplications: [{
      applicationName: {
        type: String,
        required: true,
        trim: true,
      },
      license: {
        type: String,
        enum: ['Original', 'Pirated', 'Unknown', 'Open Source'],
        required: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    }],
    security: {
      antivirus: {
        status: {
          type: String,
          enum: ['Active', 'Inactive'],
          required: true,
        },
        list: [{
          applicationName: {
            type: String,
            required: true,
            trim: true,
          },
          license: {
            type: String,
            enum: ['Original', 'Pirated', 'Unknown', 'Open Source'],
            required: true,
          },
          notes: {
            type: String,
            trim: true,
          },
        }],
      },
      vpn: {
        status: {
          type: String,
          enum: ['Available', 'Not Available'],
          required: true,
        },
        list: [{
          vpnName: {
            type: String,
            required: true,
            trim: true,
          },
          license: {
            type: String,
            enum: ['Original', 'Pirated', 'Unknown', 'Open Source'],
            required: true,
          },
          notes: {
            type: String,
            trim: true,
          },
        }],
      },
    },
    additionalInfo: {
      passwordUsage: {
        type: String,
        enum: ['Available', 'Not Available'],
        required: true,
      },
      otherNotes: {
        type: String,
        trim: true,
      },
      inspectorPICName: {
        type: String,
        trim: true,
      },
    },
    checkDate: {
      type: Date,
      required: [true, 'Check date is required'],
      index: true,
    },
    version: {
      type: Number,
      // Not required - auto-calculated in pre-validate hook
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment version
DeviceCheckSchema.pre('save', async function () {
  if (this.isNew && !this.version) {
    try {
      // Calculate next version for this employee
      const lastCheck = await DeviceCheck
        .findOne({ employeeId: this.employeeId })
        .sort({ version: -1 })
        .select('version') as IDeviceCheck | null;
      
      this.version = lastCheck && lastCheck.version ? lastCheck.version + 1 : 1;
    } catch (error) {
      console.error('Error calculating version:', error);
    }
  }
});

// Post-save hook to update employee stats
DeviceCheckSchema.post('save', async function (doc) {
  const Employee = mongoose.model('Employee');
  try {
    const employee = await Employee.findById(doc.employeeId);
    if (employee) {
      await (employee as any).updateCheckStats();
    }
  } catch (error) {
    console.error('Error updating employee stats after save:', error);
  }
});

// Post-deleteOne hook to update employee stats
DeviceCheckSchema.post('deleteOne', async function (doc) {
  const Employee = mongoose.model('Employee');
  try {
    const employee = await Employee.findById(doc.employeeId);
    if (employee) {
      await (employee as any).updateCheckStats();
    }
  } catch (error) {
    console.error('Error updating employee stats after delete:', error);
  }
});

// Indexes for performance
DeviceCheckSchema.index({ employeeId: 1, checkDate: -1 });
DeviceCheckSchema.index({ employeeId: 1, version: -1 });
DeviceCheckSchema.index({ checkDate: -1 });
DeviceCheckSchema.index({ 'deviceDetail.ownership': 1 });
DeviceCheckSchema.index({ 'deviceCondition.deviceSuitability': 1 });
DeviceCheckSchema.index({ 'employeeSnapshot.department': 1 });

const DeviceCheck: Model<IDeviceCheck> = mongoose.models.DeviceCheck || mongoose.model<IDeviceCheck>('DeviceCheck', DeviceCheckSchema);

export default DeviceCheck;