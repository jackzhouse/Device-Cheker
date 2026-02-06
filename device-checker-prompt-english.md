# AI Prompt: Employee Device Checking Application

## Project Context
Create a web application for checking company & personal device software using Next.js for the frontend. The application must be responsive and follow modern web development best practices.

**Updated Requirements:**
- Each employee can perform device checks more than once
- Versioning system based on check date
- Employee data stored in separate collection
- Form uses autocomplete + creatable dropdown to select/add new employees

## Tech Stack

### Frontend
- **Frontend Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Validation**: Zod
- **UI Components**: shadcn/ui
- **Autocomplete/Creatable Select**: React Select or Shadcn Combobox
- **TypeScript**: Required
- **PDF Generation**: react-pdf or jsPDF + html2canvas
- **Icons**: Lucide React

### Backend
- **Backend Framework**: Next.js API Routes (App Router)
- **Database**: MongoDB
- **ODM**: Mongoose
- **API Architecture**: RESTful API
- **Validation**: Zod (shared with frontend)
- **Authentication**: (Optional - can be added later)

### Database
- **Database**: MongoDB Atlas (cloud) or local MongoDB
- **ODM**: Mongoose for schema and queries
- **Connection**: MongoDB connection pooling
- **Collections**: 
  * `employees` - **NEW** Master employee data
  * `device_checks` - **UPDATED** Check data (formerly: device_checkers)
  * `dropdown_options` - Dynamic dropdown data

## Layout & Navigation

### Header (Sticky/Fixed)
```typescript
Header Component:
- Company logo (left)
- Navigation Menu (right):
  * "Form" - navigate to /form
  * "Check Data" - navigate to /data-pengecekan
  * "Employee Data" - navigate to /karyawan (NEW)
- Responsive: Hamburger menu for mobile
- Background: White/gradient with shadow
- Height: ~64px
```

### Routing Structure
```
app/
├── layout.tsx (root layout with header)
├── page.tsx (redirect to /form or landing page)
├── form/
│   └── page.tsx (Form Input - Single Page)
├── form/edit/[id]/
│   └── page.tsx (Form Edit - Pre-filled)
├── data-pengecekan/
│   └── page.tsx (Data List with Cards - Support Multiple Checks)
├── data-pengecekan/[employeeId]/
│   └── page.tsx (Check History per Employee - NEW)
├── karyawan/
│   └── page.tsx (Employee Data List - NEW)
└── api/
    ├── employees/
    │   ├── route.ts (GET all, POST create - NEW)
    │   ├── [id]/
    │   │   └── route.ts (GET by id, PUT update, DELETE - NEW)
    │   └── search/
    │       └── route.ts (GET search autocomplete - NEW)
    ├── device-checks/
    │   ├── route.ts (GET all, POST create - UPDATED)
    │   ├── [id]/
    │   │   └── route.ts (GET by id, PUT update, DELETE - UPDATED)
    │   ├── employee/[employeeId]/
    │   │   └── route.ts (GET all checks by employee - NEW)
    │   └── stats/
    │       └── route.ts (GET statistics - optional)
    └── dropdown-options/
        ├── route.ts (GET by field)
        ├── save/
        │   └── route.ts (POST new option)
        └── increment/
            └── route.ts (PUT increment usage)
```

## Backend Architecture

### MongoDB Database Design

#### Collection: `employees` **(NEW)**
Separate collection to store master employee data.

```typescript
interface EmployeeDocument {
  _id: ObjectId;
  
  // Personal Info
  firstName: string; // Required
  lastName: string; // Required
  fullName: string; // Auto-generated: firstName + lastName
  
  // Work Info
  position: string; // Autocomplete + Creatable
  department?: string; // Autocomplete + Creatable
  
  // Contact (Optional)
  email?: string;
  phoneNumber?: string;
  
  // Status
  status: 'Active' | 'Inactive' | 'Resigned';
  
  // Statistics (Auto-calculated)
  totalDeviceChecks: number; // Number of checks performed
  lastCheckDate?: Date; // Last check date
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes for employees:**
```typescript
{ fullName: 'text' } // Full-text search
{ firstName: 1, lastName: 1 } // Compound index
{ department: 1, status: 1 } // Filter by department & status
{ status: 1 } // Filter by status
```

**Mongoose Schema Methods:**
```typescript
// Pre-save hook to auto-generate fullName
employeeSchema.pre('save', function(next) {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();
  next();
});

// Method to update statistics
employeeSchema.methods.updateCheckStats = async function() {
  const checkCount = await DeviceCheck.countDocuments({ employeeId: this._id });
  const lastCheck = await DeviceCheck.findOne({ employeeId: this._id })
    .sort({ checkDate: -1 })
    .select('checkDate');
  
  this.totalDeviceChecks = checkCount;
  this.lastCheckDate = lastCheck?.checkDate;
  await this.save();
};
```

#### Collection: `device_checks` **(UPDATED from device_checkers)**
Collection to store device check data. One employee can have multiple checks.

```typescript
interface DeviceCheckDocument {
  _id: ObjectId;
  
  // Employee Reference (RELATION TO EMPLOYEES)
  employeeId: ObjectId; // Reference to employees._id (REQUIRED)
  
  // Employee Data Snapshot (Denormalized for performance & history)
  employeeSnapshot: {
    fullName: string; // Snapshot when check was performed
    position: string;
    department?: string;
  };
  
  // Device Detail
  deviceDetail: {
    deviceType: 'PC' | 'Laptop';
    ownership: 'Company' | 'Personal';
    deviceBrand: string; // Autocomplete + Creatable
    deviceModel: string; // Free text
    serialNumber: string; // Free text
  };
  
  // Operating System
  operatingSystem: {
    osType: 'Windows' | 'Linux' | 'Mac';
    osVersion: string; // Dynamic based on osType
    osLicense: 'Original' | 'Pirated' | 'Open Source' | 'Unknown';
    osRegularUpdate: boolean;
  };
  
  // Specification (Optional)
  specification?: {
    ramCapacity?: string; // Autocomplete + Creatable (e.g., 4GB, 8GB, 16GB)
    memoryType?: 'HDD' | 'SSD';
    memoryCapacity?: string; // Autocomplete + Creatable (e.g., 256GB, 512GB, 1TB)
    processor?: string; // Autocomplete + Creatable
  };
  
  // Device Condition
  deviceCondition: {
    deviceSuitability: 'Suitable' | 'Limited Suitability' | 'Needs Repair' | 'Unsuitable';
    batterySuitability: string;
    keyboardCondition: string;
    touchpadCondition: string;
    monitorCondition: string;
    wifiCondition: string;
  };
  
  // Applications (Dynamic Arrays)
  workApplications: Array<{
    applicationName: string; // Autocomplete + Creatable
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  
  nonWorkApplications: Array<{
    applicationName: string; // Autocomplete + Creatable
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  
  // Security
  security: {
    antivirus: {
      status: 'Active' | 'Inactive';
      list: Array<{
        applicationName: string; // Autocomplete + Creatable
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
    vpn: {
      status: 'Available' | 'Not Available';
      list: Array<{
        vpnName: string; // Autocomplete + Creatable
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
  };
  
  // Additional Info
  additionalInfo: {
    passwordUsage: 'Available' | 'Not Available';
    otherNotes?: string;
    inspectorPICName?: string; // Autocomplete + Creatable
  };
  
  // Versioning & Metadata
  checkDate: Date; // Check date (IMPORTANT for versioning)
  version: number; // Auto-increment version number per employee
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes for device_checks:**
```typescript
{ employeeId: 1, checkDate: -1 } // Query checks by employee, sorted by date
{ employeeId: 1, version: -1 } // Query by employee & version
{ checkDate: -1 } // Sort all checks by date
{ 'deviceDetail.ownership': 1 } // Filter by ownership
{ 'deviceCondition.deviceSuitability': 1 } // Filter by device condition
{ 'employeeSnapshot.department': 1 } // Filter by department
```

**Mongoose Schema Methods:**
```typescript
// Pre-save hook to auto-increment version
deviceCheckSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Calculate next version for this employee
    const lastCheck = await this.constructor
      .findOne({ employeeId: this.employeeId })
      .sort({ version: -1 })
      .select('version');
    
    this.version = lastCheck ? lastCheck.version + 1 : 1;
  }
  next();
});

// Post-save hook to update employee stats
deviceCheckSchema.post('save', async function(doc) {
  const Employee = mongoose.model('Employee');
  const employee = await Employee.findById(doc.employeeId);
  if (employee) {
    await employee.updateCheckStats();
  }
});

// Post-remove hook to update employee stats
deviceCheckSchema.post('remove', async function(doc) {
  const Employee = mongoose.model('Employee');
  const employee = await Employee.findById(doc.employeeId);
  if (employee) {
    await employee.updateCheckStats();
  }
});
```

**Design Pattern: Denormalization for History**
```typescript
/**
 * WHY USE employeeSnapshot?
 * 
 * Because employee data can change (position change, department transfer, etc.),
 * we need to save employee data snapshot when the check was performed.
 * 
 * This ensures historical records remain accurate and don't change
 * when master employee data is updated.
 * 
 * Trade-offs:
 * - Pro: Historical accuracy, faster queries (no JOIN), data integrity
 * - Con: Data duplication, slightly larger storage
 * 
 * For device checking applications, historical accuracy is more important!
 */
```

#### Collection: `dropdown_options` (REMAINS THE SAME)
Collection to store all dynamic dropdown options that can be updated.

```typescript
interface DropdownOptionDocument {
  _id: ObjectId;
  
  // Field identifier (name of field using this option)
  fieldName: string; // e.g., 'position', 'department', 'deviceBrand', 'applicationName', etc.
  
  // Category for grouping (optional)
  category?: string; // e.g., 'workApps', 'nonWorkApps', 'antivirus', 'vpn'
  
  // Stored value
  value: string; // e.g., 'Software Engineer', 'Dell', 'Microsoft Office'
  
  // Metadata
  usageCount: number; // How many times this value has been used (for sorting by popularity)
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date; // Last time used
}
```

**Indexes for dropdown_options:**
```typescript
// Compound index for fast queries
{ fieldName: 1, value: 1 } - unique
{ fieldName: 1, usageCount: -1 } - for sorting by popularity
{ fieldName: 1, category: 1 } - for filtering by category
```

### API Endpoints

#### **EMPLOYEES API (NEW)**

##### 1. **GET /api/employees**
Get all employees
```typescript
// Query Parameters (optional):
// - page: number (pagination)
// - limit: number (items per page)
// - search: string (search by name)
// - department: string (filter by department)
// - status: string (filter by status: Active/Inactive/Resigned)
// - sortBy: string (sort field: fullName, lastCheckDate, totalDeviceChecks)
// - sortOrder: 'asc' | 'desc'

Response: {
  success: true,
  data: EmployeeDocument[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

##### 2. **POST /api/employees**
Create new employee
```typescript
Request Body: {
  firstName: string,
  lastName: string,
  position: string,
  department?: string,
  email?: string,
  phoneNumber?: string,
  status?: 'Active' | 'Inactive' | 'Resigned' // default: 'Active'
}

Response: {
  success: true,
  data: EmployeeDocument
}

// NOTE: Automatically saves position & department to dropdown_options
```

##### 3. **GET /api/employees/[id]**
Get employee by ID
```typescript
Response: {
  success: true,
  data: EmployeeDocument & {
    deviceChecks: DeviceCheckDocument[] // Include recent checks (latest 5)
  }
}
```

##### 4. **PUT /api/employees/[id]**
Update employee
```typescript
Request Body: Partial<EmployeeDocument>

Response: {
  success: true,
  data: EmployeeDocument
}
```

##### 5. **DELETE /api/employees/[id]**
Delete employee
```typescript
// Soft delete: Update status to 'Resigned'
// Hard delete: Only if no device checks exist

Response: {
  success: true,
  message: string
}
```

##### 6. **GET /api/employees/search** (NEW - for autocomplete)
Search employees for autocomplete
```typescript
// Query Parameters:
// - q: string (search query)
// - limit: number (default: 10)
// - status: string (default: 'Active')

Response: {
  success: true,
  data: Array<{
    _id: string,
    fullName: string,
    firstName: string,
    lastName: string,
    position: string,
    department?: string,
    totalDeviceChecks: number,
    lastCheckDate?: string
  }>
}
```

#### **DEVICE CHECKS API (UPDATED)**

##### 1. **GET /api/device-checks**
Get all device checks
```typescript
// Query Parameters (optional):
// - page: number (pagination)
// - limit: number (items per page)
// - search: string (search by employee name or device)
// - employeeId: string (filter by employee)
// - department: string (filter by department)
// - suitability: string (filter by device condition)
// - ownership: string (filter by ownership)
// - dateFrom: string (filter by date range)
// - dateTo: string (filter by date range)
// - sortBy: string (default: checkDate)
// - sortOrder: 'asc' | 'desc' (default: desc)

Response: {
  success: true,
  data: Array<DeviceCheckDocument & {
    employee: { // Populated employee data
      _id: string,
      fullName: string,
      status: string
    }
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

##### 2. **POST /api/device-checks**
Create new device check
```typescript
Request Body: {
  employeeId: string, // REQUIRED - Employee ID from dropdown
  deviceDetail: {...},
  operatingSystem: {...},
  specification?: {...},
  deviceCondition: {...},
  workApplications: [...],
  nonWorkApplications: [...],
  security: {...},
  additionalInfo: {...},
  checkDate: string // ISO date string
}

Process Flow:
1. Validate employeeId exists
2. Fetch employee data for snapshot
3. Auto-increment version number
4. Save device check
5. Update employee statistics
6. Save all dropdown values to dropdown_options

Response: {
  success: true,
  data: DeviceCheckDocument & {
    employee: EmployeeDocument
  }
}
```

##### 3. **GET /api/device-checks/[id]**
Get device check by ID
```typescript
Response: {
  success: true,
  data: DeviceCheckDocument & {
    employee: EmployeeDocument // Populated employee data
  }
}
```

##### 4. **PUT /api/device-checks/[id]**
Update device check
```typescript
Request Body: Partial<DeviceCheckDocument>

// NOTE: employeeId CANNOT be changed after creation
// If need to change employee, must create new check

Response: {
  success: true,
  data: DeviceCheckDocument
}
```

##### 5. **DELETE /api/device-checks/[id]**
Delete device check
```typescript
Response: {
  success: true,
  message: string
}

// Post-delete: Update employee statistics
```

##### 6. **GET /api/device-checks/employee/[employeeId]** (NEW)
Get all device checks for specific employee (History)
```typescript
// Query Parameters:
// - page: number
// - limit: number
// - sortBy: 'checkDate' | 'version'
// - sortOrder: 'asc' | 'desc' (default: desc)

Response: {
  success: true,
  data: {
    employee: EmployeeDocument,
    checks: DeviceCheckDocument[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    summary: {
      totalChecks: number,
      latestCheckDate: string,
      deviceTypes: {
        PC: number,
        Laptop: number
      },
      ownership: {
        Company: number,
        Personal: number
      }
    }
  }
}
```

##### 7. **GET /api/device-checks/stats** (Optional)
Get statistics
```typescript
Response: {
  success: true,
  data: {
    totalChecks: number,
    totalEmployees: number,
    byDepartment: Array<{
      department: string,
      count: number
    }>,
    byDeviceCondition: Array<{
      suitability: string,
      count: number
    }>,
    byOwnership: {
      Company: number,
      Personal: number
    },
    recentChecks: DeviceCheckDocument[] // Latest 10
  }
}
```

#### **DROPDOWN OPTIONS API (REMAINS THE SAME)**

##### 1. **GET /api/dropdown-options**
Get dropdown options by field
```typescript
// Query Parameters:
// - fieldName: string (REQUIRED)
// - category?: string (optional, for filtering by category)
// - limit?: number (default: 50)

Response: {
  success: true,
  data: Array<{
    value: string,
    usageCount: number,
    category?: string
  }>
}
```

##### 2. **POST /api/dropdown-options/save**
Save new dropdown option
```typescript
Request Body: {
  fieldName: string,
  value: string,
  category?: string
}

Response: {
  success: true,
  data: DropdownOptionDocument
}
```

##### 3. **PUT /api/dropdown-options/increment**
Increment usage count
```typescript
Request Body: {
  fieldName: string,
  value: string,
  category?: string
}

Response: {
  success: true,
  data: DropdownOptionDocument
}
```

## Frontend Implementation

### Form Page Updates

#### Employee Selection Component (NEW)
```typescript
/**
 * Component: EmployeeAutocomplete
 * 
 * Features:
 * - Autocomplete search from database employees
 * - Creatable: Can add new employee directly from form
 * - Show employee info (position, department, total checks)
 * - Link to employee history
 */

interface EmployeeAutocompleteProps {
  value?: string; // employeeId
  onChange: (employeeId: string) => void;
  error?: string;
}

// Usage in Form:
<EmployeeAutocomplete
  value={selectedEmployeeId}
  onChange={(id) => {
    setValue('employeeId', id);
    // Fetch employee data to pre-fill position & department
    fetchEmployeeData(id);
  }}
  error={errors.employeeId?.message}
/>

// When user creates new employee:
1. Show modal/dialog for input:
   - First Name (required)
   - Last Name (required)
   - Position (autocomplete + creatable)
   - Department (autocomplete + creatable)
2. Call POST /api/employees
3. Auto-select newly created employee
4. Close modal
5. Pre-fill form with employee data
```

#### Form Structure Changes
```typescript
// BEFORE (OLD):
interface FormData {
  employeeData: {
    firstName: string;
    lastName: string;
    position: string;
    department?: string;
  };
  // ... rest of fields
}

// AFTER (NEW):
interface FormData {
  employeeId: string; // REQUIRED - Selected from dropdown or created
  // employeeData NO LONGER exists in form
  // position & department will be auto-populated from employee data
  
  deviceDetail: {...};
  operatingSystem: {...};
  // ... rest of fields
}

// Pre-fill behavior:
// When user selects employee from dropdown:
1. Fetch employee data
2. Display employee info (read-only):
   - Full Name
   - Position
   - Department
   - Total Device Checks
   - Link to "View Check History"
3. If employee has previous checks, show info:
   "This employee has {count} previous device check(s). 
    View history →"
```

#### Validation Schema Updates
```typescript
// Zod Schema for Form
const deviceCheckFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee must be selected'),
  
  deviceDetail: z.object({
    deviceType: z.enum(['PC', 'Laptop']),
    ownership: z.enum(['Company', 'Personal']),
    deviceBrand: z.string().min(1, 'Device brand is required'),
    deviceModel: z.string().min(1, 'Device model is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
  }),
  
  // ... rest of validation
  
  checkDate: z.string().or(z.date()),
});

// Zod Schema for Create Employee Modal
const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
});
```

### Check Data Page Updates

#### Card List Component (UPDATED)
```typescript
/**
 * Component: DeviceCheckCard
 * 
 * Changes:
 * - Display employee info prominently
 * - Show version badge (v1, v2, v3, etc.)
 * - Link to employee check history
 * - Group by employee option
 */

interface DeviceCheckCardProps {
  check: DeviceCheckDocument & {
    employee: EmployeeDocument;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewHistory: (employeeId: string) => void;
}

// Card Layout:
┌─────────────────────────────────────────┐
│ [Employee Avatar/Icon]                  │
│ EMPLOYEE FULL NAME                      │
│ Position • Department                   │
│ ─────────────────────────────────────── │
│ 📅 Date: DD MMM YYYY                    │
│ 🔢 Version: v{version}                  │
│ 💻 Device: Brand - Model (PC/Laptop)    │
│ 🏢 Ownership: Company/Personal          │
│ ✅ Status: [Badge with color]           │
│ ─────────────────────────────────────── │
│ [View History] [Edit] [Delete]          │
└─────────────────────────────────────────┘
```

#### Filters (UPDATED)
```typescript
// Filter options:
- Search (employee name, device brand, model)
- Department (dropdown from employee data)
- Device Suitability (dropdown)
- Ownership (dropdown)
- Date Range (from - to)
- Group by Employee (toggle)

// Group by Employee view:
Display checks grouped per employee:
┌─────────────────────────────────────────┐
│ EMPLOYEE NAME (Total: 5 checks)         │
│ ├─ Latest: v5 - DD MMM YYYY             │
│ ├─ v4 - DD MMM YYYY                     │
│ ├─ v3 - DD MMM YYYY                     │
│ └─ [View All History]                   │
└─────────────────────────────────────────┘
```

### Employee Check History Page (NEW)

```
Route: /data-pengecekan/[employeeId]
```

```typescript
/**
 * Page: Employee Device Check History
 * 
 * Features:
 * - Show all checks for specific employee
 * - Timeline view (newest first)
 * - Compare versions
 * - Download PDF for specific version
 * - Export all history to PDF
 */

// Layout:
┌─────────────────────────────────────────────────────┐
│ [Back to Check Data]                                │
│                                                      │
│ EMPLOYEE INFO HEADER                                │
│ ┌─────────────────────────────────────────────┐    │
│ │ [Avatar] FULL NAME                           │    │
│ │ Position: xxx                                │    │
│ │ Department: xxx                              │    │
│ │ Total Checks: 5                              │    │
│ │ Latest Check: DD MMM YYYY                    │    │
│ │ [Edit Employee Info]                         │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ SUMMARY CARDS                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ Total│ │ PC   │ │Laptop│ │Status│               │
│ │  5   │ │  2   │ │  3   │ │ Mix  │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│ TIMELINE (Vertical Timeline)                        │
│ ┌─────────────────────────────────────────────┐    │
│ │ ● v5 - DD MMM YYYY (Latest)                 │    │
│ │   PC - Dell OptiPlex 7090                   │    │
│ │   Status: Suitable                          │    │
│ │   [View Details] [Download PDF] [Edit]      │    │
│ │                                              │    │
│ │ ● v4 - DD MMM YYYY                          │    │
│ │   Laptop - HP EliteBook 840                 │    │
│ │   Status: Limited Suitability               │    │
│ │   [View Details] [Download PDF]             │    │
│ │                                              │    │
│ │ ● v3 - DD MMM YYYY                          │    │
│ │   ...                                        │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ [Export All to PDF] [Add New Check]                │
└─────────────────────────────────────────────────────┘
```

### Employee Page (NEW)

```
Route: /karyawan
```

```typescript
/**
 * Page: Employee Data
 * 
 * Features:
 * - List all employees
 * - Search & filter
 * - Add/Edit/Delete employee
 * - View employee check history
 * - Export employee list
 */

// Layout:
┌─────────────────────────────────────────────────────┐
│ Employee Data                                       │
│ ─────────────────────────────────────────────────── │
│ [Search...] [Filter Dept▼] [Filter Status▼]        │
│ [+ Add Employee]                        [Export]    │
│                                                      │
│ TABLE VIEW                                          │
│ ┌───┬─────────┬──────────┬────────┬───────┬──────┐ │
│ │No │ Name    │ Position │ Dept   │Checks │Action│ │
│ ├───┼─────────┼──────────┼────────┼───────┼──────┤ │
│ │ 1 │John Doe │Developer │IT      │  5    │ ...  │ │
│ │ 2 │Jane S.  │Manager   │HR      │  3    │ ...  │ │
│ └───┴─────────┴──────────┴────────┴───────┴──────┘ │
│                                                      │
│ [Pagination]                                        │
└─────────────────────────────────────────────────────┘

// Actions per row:
- View History (→ /data-pengecekan/[employeeId])
- Edit Employee
- Delete Employee (with confirmation)
- Add New Check (→ /form with employee pre-selected)
```

## Database Relationships & Queries

### Relationship Diagram
```
┌──────────────┐         ┌──────────────────┐
│  employees   │────1:N──│  device_checks   │
│              │         │                  │
│ _id          │◄────────│ employeeId (FK)  │
│ firstName    │         │ version          │
│ lastName     │         │ employeeSnapshot │
│ position     │         │ deviceDetail     │
│ department   │         │ ...              │
└──────────────┘         └──────────────────┘
       │
       │ (denormalized)
       ▼
  position, department
  saved to dropdown_options
```

### Common Queries

#### 1. Get Employee with Latest Check
```typescript
const employee = await Employee.findById(employeeId);
const latestCheck = await DeviceCheck
  .findOne({ employeeId })
  .sort({ version: -1 });

// Or with aggregation:
const result = await Employee.aggregate([
  { $match: { _id: employeeId } },
  {
    $lookup: {
      from: 'device_checks',
      localField: '_id',
      foreignField: 'employeeId',
      as: 'checks',
      pipeline: [
        { $sort: { version: -1 } },
        { $limit: 1 }
      ]
    }
  },
  { $unwind: { path: '$checks', preserveNullAndEmptyArrays: true } }
]);
```

#### 2. Get All Checks for Employee (with pagination)
```typescript
const checks = await DeviceCheck
  .find({ employeeId })
  .sort({ version: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

const total = await DeviceCheck.countDocuments({ employeeId });
```

#### 3. Get Checks with Employee Data (for list page)
```typescript
const checks = await DeviceCheck
  .find(filters)
  .populate('employeeId', 'fullName position department status')
  .sort({ checkDate: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

#### 4. Get Summary Statistics
```typescript
// Employee with most checks
const topEmployee = await DeviceCheck.aggregate([
  { $group: {
      _id: '$employeeId',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 1 },
  {
    $lookup: {
      from: 'employees',
      localField: '_id',
      foreignField: '_id',
      as: 'employee'
    }
  }
]);

// Checks by department
const byDepartment = await DeviceCheck.aggregate([
  { $group: {
      _id: '$employeeSnapshot.department',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]);
```

## API Service Layer

### Frontend API Clients

#### employees.service.ts (NEW)
```typescript
export async function getEmployees(params: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<APIResponse<EmployeeDocument[]>> {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/employees?${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employees');
  }
  
  return response.json();
}

export async function searchEmployees(
  query: string,
  limit = 10
): Promise<APIResponse<EmployeeDocument[]>> {
  const response = await fetch(
    `/api/employees/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search employees');
  }
  
  return response.json();
}

export async function createEmployee(
  data: CreateEmployeeData
): Promise<APIResponse<EmployeeDocument>> {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create employee');
  }
  
  return response.json();
}

export async function getEmployeeById(
  id: string
): Promise<APIResponse<EmployeeDocument>> {
  const response = await fetch(`/api/employees/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employee');
  }
  
  return response.json();
}

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeDocument>
): Promise<APIResponse<EmployeeDocument>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update employee');
  }
  
  return response.json();
}

export async function deleteEmployee(
  id: string
): Promise<APIResponse<any>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete employee');
  }
  
  return response.json();
}
```

#### device-checks.service.ts (UPDATED)
```typescript
export async function getDeviceChecks(params: {
  page?: number;
  limit?: number;
  search?: string;
  employeeId?: string;
  department?: string;
  suitability?: string;
  ownership?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<APIResponse<DeviceCheckDocument[]>> {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/device-checks?${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch device checks');
  }
  
  return response.json();
}

export async function getEmployeeChecks(
  employeeId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<APIResponse<any>> {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(
    `/api/device-checks/employee/${employeeId}?${queryString}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employee checks');
  }
  
  return response.json();
}

export async function createDeviceCheck(
  data: CreateDeviceCheckData
): Promise<APIResponse<DeviceCheckDocument>> {
  const response = await fetch('/api/device-checks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create device check');
  }
  
  return response.json();
}

export async function getDeviceCheckById(
  id: string
): Promise<APIResponse<DeviceCheckDocument>> {
  const response = await fetch(`/api/device-checks/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch device check');
  }
  
  return response.json();
}

export async function updateDeviceCheck(
  id: string,
  data: Partial<DeviceCheckDocument>
): Promise<APIResponse<DeviceCheckDocument>> {
  const response = await fetch(`/api/device-checks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update device check');
  }
  
  return response.json();
}

export async function deleteDeviceCheck(
  id: string
): Promise<APIResponse<any>> {
  const response = await fetch(`/api/device-checks/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete device check');
  }
  
  return response.json();
}
```

## Additional Features (Nice to Have)

1. **Form Draft Auto-Save**
   - Save progress to localStorage every 30 seconds
   - Restore draft when user returns to form

2. **Print Preview**
   - Generate printable summary from filled form

3. **Export to PDF**
   - Export form result to PDF format
   - Export employee check history to PDF

4. **Dark Mode**
   - Toggle dark/light mode

5. **Multi-language Support**
   - i18n for Indonesian and English

6. **Compare Versions** (NEW)
   - Compare 2 device checks to see changes
   - Highlight differences
   - Timeline visualization

7. **Employee Statistics Dashboard** (NEW)
   - Charts for visualization:
     * Device checks per month
     * Device condition distribution
     * Department statistics
     * Ownership breakdown

8. **Bulk Import** (NEW)
   - Import employee data from CSV/Excel
   - Import device check data from template

9. **Email Notifications** (NEW)
   - Email reminder for employees who haven't checked devices
   - Email report for IT manager

10. **Advanced Search** (NEW)
    - Full-text search across all fields
    - Saved search filters
    - Search history

## Notes for AI
- Prioritize code quality and readability
- Use TypeScript with strict mode
- Follow Next.js 14+ best practices (App Router)
- Implement proper error boundaries
- Add loading states for all actions (submit, delete, PDF generation)
- Use semantic HTML
- Optimize for performance (lazy loading, code splitting)
- Add helpful comments for complex logic
- Follow consistent naming conventions
- Implement proper form state management

### Form Implementation
- **Single Page Layout**: All sections in one long page (scroll down)
- **NO Multi-Step**: No next/previous buttons between sections
- **Progress Indicator**: Sidebar (desktop) or top bar (mobile) for section navigation
- **Smooth Scroll**: Implement scroll-to-section when clicking progress indicator
- **Section Highlighting**: Active state based on scroll position (scroll spy)

### Employee Selection UX
- **Autocomplete with Search**: Fuzzy search for employee names
- **Show Employee Info**: Display position, department, total checks when selecting
- **Quick Create**: Modal/dialog to add new employee directly from form
- **Pre-fill Data**: Auto-populate position & department from employee data
- **History Link**: Link to employee check history (if exists)
- **Validation**: Ensure employee exists before allowing form submission

### Dynamic Fields Implementation
- **Use `useFieldArray` from React Hook Form:**
  ```typescript
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workApplications" // or nonWorkApplications, antivirusList, vpnList
  });
  ```
- **Inline Editing**: All edits done directly in field, NO modal/dialog
- **UX Patterns:**
  - Each row must have delete button (🗑️) if items > 1
  - "Add" button below list with clear "+" icon
  - Smooth animation when add/remove field (fade + slide)
  - Validation error per field item
  - Row numbering for clarity (optional)

### Check Data Page
- **Card Grid Layout**: Responsive grid for displaying data cards
- **Employee Grouping**: Option to group checks by employee
- **Version Badge**: Show version number on each card (v1, v2, v3)
- **Quick Actions**:
  * View employee history
  * Edit check
  * Delete check (with confirmation)
  * Download PDF
- **Filters**:
  * Search (employee name, device)
  * Department filter
  * Device condition filter
  * Ownership filter
  * Date range filter
  * Group by employee toggle
- **Preview**: 
  * Can be modal (dialog) or full page
  * Document format with neat tables
  * Include "Download PDF" button
  * Print-friendly styling
- **Edit**: Navigate to `/form/edit/[id]` with pre-filled form
- **Delete**: MUST have confirmation dialog before delete
- **PDF Generation**: 
  * Use jsPDF or react-pdf
  * Professional format with header and footer
  * All data in structured tables

### Employee History Page (NEW)
- **Timeline View**: Vertical timeline showing all checks chronologically
- **Summary Cards**: Statistics for employee's device checks
- **Version Compare**: Ability to compare 2 versions side-by-side
- **Bulk Actions**: Export all checks to single PDF
- **Quick Add**: Button to add new check for this employee

### Backend Best Practices
- **MongoDB Connection**:
  * Use connection pooling (global cache)
  * Handle connection errors gracefully
  * Close connections properly
  
- **API Routes**:
  * Always validate ObjectId before querying
  * Use try-catch for all database operations
  * Return consistent response format
  * Proper HTTP status codes (200, 201, 400, 404, 500)
  * Log errors for debugging
  
- **Mongoose Model**:
  * Define proper schema with types
  * Use enums for predefined values
  * Add indexes for frequently queried fields
  * Enable timestamps (createdAt, updatedAt)
  * Use lean() for better performance in read operations
  * **Implement pre/post hooks for auto-increment version**
  * **Implement post hooks to update employee stats**
  
- **Validation**:
  * Share Zod schema between frontend and backend
  * Validate input in API routes before save
  * Handle validation errors with clear messages
  * **Validate employeeId exists before creating check**
  
- **Data Integrity**:
  * **Snapshot employee data when creating check** (denormalization)
  * **Auto-increment version number** per employee
  * **Update employee statistics** after create/delete check
  * **Prevent changing employeeId** after check created
  * Handle orphaned checks (employee deleted but checks exist)

### State Management
- Use React hooks (useState, useEffect) for local state
- Custom hooks for data fetching:
  * `useEmployees` - for fetching employees
  * `useDeviceChecks` - for fetching device checks
  * `useEmployeeHistory` - for fetching employee check history
- React Query or SWR for data caching (optional, recommended)
- Local Storage for draft auto-save (optional)

### Error Handling
- Frontend: Try-catch for API calls, show toast notifications
- Backend: Try-catch in all routes, return proper error messages
- Handle network errors, validation errors, database errors separately
- User-friendly error messages
- **Handle employee not found errors**
- **Handle version conflict errors** (rare, but possible with concurrent creates)

### Accessibility
- Proper ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management for modals/dialogs
- Screen reader friendly
- **Accessible autocomplete** with proper ARIA attributes

### Performance
- Lazy load sections if needed
- Debounce for search/filter (especially autocomplete)
- Optimize re-renders with React.memo
- Use MongoDB indexes for faster queries:
  * **Index employeeId for quick employee lookups**
  * **Compound index (employeeId, version) for version queries**
  * **Index checkDate for date-based queries**
- Implement pagination for large datasets
- Cache API responses (with React Query/SWR)
- **Populate employee data efficiently** (select only needed fields)
- **Use aggregation pipeline** for complex queries & statistics

## Success Criteria

### Backend & Database
✅ MongoDB connection successfully established
✅ Mongoose models properly defined (Employee, DeviceCheck, DropdownOption)
✅ Database indexes installed for performance
✅ API routes functioning correctly (GET, POST, PUT, DELETE)
✅ **Employee API endpoints working** (CRUD operations)
✅ **Device Check API endpoints working** (CRUD + employee-specific queries)
✅ **Dropdown Options API working** (GET, POST, increment)
✅ **Version auto-increment working** with pre-save hook
✅ **Employee stats auto-update** with post-save/remove hooks
✅ **Employee snapshot saved** when creating device check
✅ Validation working in backend (Zod schema)
✅ Proper error handling in all API routes
✅ Consistent API response format
✅ Pagination working for list data
✅ Search and filter working properly
✅ **Employee data population** working efficiently

### Form Page
✅ Single page scroll layout working well
✅ Progress indicator shows active section
✅ Smooth scroll to section when clicking progress indicator
✅ All sections visible on one page
✅ **EmployeeAutocomplete component working well**
✅ **Search employees from database working**
✅ **Create new employee from form working**
✅ **Employee data pre-fills after selection**
✅ **Show employee info** (position, department, total checks)
✅ **Link to employee history** if employee has previous checks
✅ **CreatableAutocomplete component** for other fields working
✅ Dynamic fields (add/remove) working with smooth animation
✅ Inline editing without modal for dynamic fields
✅ Real-time validation and clear error messages
✅ Form can submit to API with complete and valid data
✅ **employeeId validated** before submit
✅ **Version auto-increments** on create
✅ **Employee snapshot saved** with correct data
✅ Loading state during submit
✅ Success notification after successful submit
✅ Error notification if submit fails
✅ Data saved to MongoDB

### Autocomplete/Dropdown Specific
✅ **Employee autocomplete** with fuzzy search
✅ **Create employee modal/dialog** with good UX
✅ **Employee info display** when selected
✅ Position field uses autocomplete with DB data
✅ Department field uses autocomplete with DB data
✅ Device brand field uses autocomplete with DB data
✅ RAM capacity field uses autocomplete with DB data
✅ Memory capacity field uses autocomplete with DB data
✅ Processor field uses autocomplete with DB data
✅ Application name field (work/non-work/antivirus) with category-specific data
✅ VPN name field with DB data
✅ Inspector PIC name uses autocomplete with DB data
✅ Search/filter in autocomplete working
✅ "Create new" button appears for non-existent values
✅ New option immediately saved when created
✅ Dropdown data updates real-time after creation
✅ Usage count displays on each option

### Check Data Page
✅ Card grid layout responsive on all device sizes
✅ Data fetched from API correctly
✅ **Employee data populated** on each card
✅ **Version badge** displays clearly
✅ Loading skeleton during data fetch
✅ Card displays device information clearly
✅ **Card displays employee information** clearly
✅ Status badge with appropriate colors (green/yellow/red)
✅ Pagination working with large data sets
✅ Search and filter working
✅ **Filter by employee** working
✅ **Group by employee** toggle working
✅ **Employee group view** displays checks per employee
✅ Preview modal/page displays data in document format
✅ Tables in preview are neat and readable
✅ Download PDF working with good format
✅ **Link to employee history** working
✅ Edit button navigates to edit form with pre-filled data from API
✅ Edit form can update data to API
✅ Delete button shows confirmation dialog
✅ Delete confirmation dialog clear and user-friendly
✅ Data successfully deleted from database after confirmation
✅ **Employee stats update** after delete
✅ List auto-refreshes after delete

### Employee History Page (NEW)
✅ Page renders with correct employee data
✅ **Employee info header** displays complete data
✅ **Summary cards** display accurate statistics
✅ **Timeline view** displays all checks chronologically
✅ **Version labels** clear on each timeline item
✅ Quick actions per check working (view, edit, delete, download)
✅ **Add new check button** navigates to form with employee pre-selected
✅ **Export all to PDF** working
✅ Pagination for history with many checks
✅ Loading states for data fetch
✅ Error handling if employee not found

### Employee Page (NEW)
✅ Page displays employee list correctly
✅ Search employees working
✅ Filter by department working
✅ Filter by status working
✅ **Add employee button** opens modal/form
✅ **Create employee** from this page working
✅ **Edit employee** inline or modal working
✅ **Delete employee** with confirmation working
✅ **Soft delete** (status = Resigned) for employees with checks
✅ **Hard delete** for employees without checks
✅ **View history link** navigates to employee history page
✅ **Add check link** navigates to form with employee pre-selected
✅ **Total checks column** displays correct number
✅ **Last check date** displays correct date
✅ Pagination working
✅ Export employee list working

### General
✅ Sticky header with working navigation
✅ **Navigation to Employee page** working
✅ Responsive on mobile, tablet, and desktop
✅ All validation working correctly (frontend & backend)
✅ **Employee validation** working (exists, not duplicate)
✅ **Version versioning** working automatically
✅ **Employee stats calculation** accurate
✅ **Denormalized data (snapshot)** saved correctly
✅ Proper error handling (network, validation, database errors)
✅ Loading states for all actions
✅ Toast notifications for feedback
✅ No console errors or warnings
✅ Code easy to maintain and extend
✅ Accessible for keyboard navigation
✅ Optimal performance (fast load, smooth interactions)
✅ Proper TypeScript types without `any`
✅ Clean code with helpful comments
✅ Environment variables properly configured
✅ API endpoints documented
✅ **Relationship between employees & checks** properly maintained
✅ **Data integrity** maintained (no orphaned data)

## Migration Guide (If Updating from Old Version)

### Database Migration Steps

```typescript
/**
 * Migration Script: device_checkers → employees + device_checks
 * 
 * Steps:
 * 1. Create new collections: employees, device_checks
 * 2. Extract unique employees from device_checkers
 * 3. Create employee documents
 * 4. Create device_check documents with employeeId reference
 * 5. Auto-increment version per employee
 * 6. Calculate employee statistics
 * 7. Verify data integrity
 * 8. Backup old collection (optional)
 * 9. Drop old collection (after verification)
 */

// Example migration script:
async function migrateToNewSchema() {
  // 1. Fetch all old device_checkers
  const oldChecks = await db.collection('device_checkers').find().toArray();
  
  // 2. Extract unique employees
  const employeeMap = new Map();
  
  oldChecks.forEach(check => {
    const key = `${check.employeeData.firstName}|${check.employeeData.lastName}`;
    if (!employeeMap.has(key)) {
      employeeMap.set(key, {
        firstName: check.employeeData.firstName,
        lastName: check.employeeData.lastName,
        position: check.employeeData.position,
        department: check.employeeData.department,
        checks: []
      });
    }
    employeeMap.get(key).checks.push(check);
  });
  
  // 3. Create employees and device_checks
  for (const [key, empData] of employeeMap) {
    // Create employee
    const employee = await Employee.create({
      firstName: empData.firstName,
      lastName: empData.lastName,
      position: empData.position,
      department: empData.department,
      status: 'Active'
    });
    
    // Create device checks with version
    let version = 1;
    for (const oldCheck of empData.checks) {
      const { employeeData, ...checkData } = oldCheck;
      
      await DeviceCheck.create({
        ...checkData,
        employeeId: employee._id,
        employeeSnapshot: {
          fullName: employee.fullName,
          position: employee.position,
          department: employee.department
        },
        version: version++
      });
    }
    
    // Update employee stats
    await employee.updateCheckStats();
  }
  
  console.log('Migration completed!');
}
```

### API Breaking Changes

**OLD Endpoints:**
- ~~GET /api/device-checker~~
- ~~POST /api/device-checker~~
- ~~GET /api/device-checker/[id]~~
- ~~PUT /api/device-checker/[id]~~
- ~~DELETE /api/device-checker/[id]~~

**NEW Endpoints:**
- GET /api/employees (NEW)
- POST /api/employees (NEW)
- GET /api/employees/[id] (NEW)
- GET /api/employees/search (NEW)
- GET /api/device-checks (UPDATED)
- POST /api/device-checks (UPDATED - requires employeeId)
- GET /api/device-checks/[id] (UPDATED)
- GET /api/device-checks/employee/[employeeId] (NEW)
- PUT /api/device-checks/[id] (UPDATED)
- DELETE /api/device-checks/[id] (UPDATED)

### Frontend Breaking Changes

**Form Data Structure:**
```typescript
// OLD:
{
  employeeData: {
    firstName: string,
    lastName: string,
    position: string,
    department: string
  },
  deviceDetail: {...},
  // ...
}

// NEW:
{
  employeeId: string, // REQUIRED - selected or created
  // No employeeData in form
  deviceDetail: {...},
  // ...
}
```

**Component Changes:**
- Replace manual name inputs with EmployeeAutocomplete
- Add employee info display section
- Add link to employee history
- Update validation schema

---

**END OF UPDATED PROMPT**
