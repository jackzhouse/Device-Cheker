'use client';

import * as React from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchEmployees, createEmployee, type Employee } from '@/lib/services/employees.service';
import { CreatableSelect, type SelectOption } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EmployeeAutocompleteProps {
  value?: string;
  onChange: (employeeId: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function EmployeeAutocomplete({
  value,
  onChange,
  error,
  disabled = false,
  className,
}: EmployeeAutocompleteProps) {
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Search employees
  React.useEffect(() => {
    const searchEmployeesEffect = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchEmployees(debouncedSearch, 10);
        if (response.success && response.data) {
          const employeeOptions = response.data.map((emp) => ({
            value: emp._id,
            label: `${emp.fullName} - ${emp.position}`,
            employee: emp,
          }));
          setOptions(employeeOptions);
        }
      } catch (error: any) {
        console.error('Error searching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    searchEmployeesEffect();
  }, [debouncedSearch]);

  const handleEmployeeSelect = async (employeeId: string) => {
    const option = options.find((opt) => opt.value === employeeId);
    if (option && (option as any).employee) {
      setSelectedEmployee((option as any).employee);
    }
    onChange(employeeId);
  };

  const handleCreateEmployee = async (firstName: string, lastName: string, position: string, department: string) => {
    try {
      const response = await createEmployee({
        firstName,
        lastName,
        position,
        department: department || undefined,
        status: 'Active',
      });

      if (response.success && response.data) {
        toast.success('Employee created successfully');
        setIsCreateModalOpen(false);
        // Ensure ID is a string
        const employeeId = String(response.data._id);
        handleEmployeeSelect(employeeId);
      } else {
        toast.error('Failed to create employee');
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.message || 'Failed to create employee');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCreateFromSearch = (name: string) => {
    const names = name.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    
    // Open create modal with pre-filled data
    setCreateFormData({
      firstName,
      lastName,
      position: '',
      department: '',
    });
    setIsCreateModalOpen(true);
  };

  const [createFormData, setCreateFormData] = React.useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
  });

  return (
    <div className={className}>
      <CreatableSelect
        options={options}
        value={value}
        onChange={handleEmployeeSelect}
        onCreate={handleCreateFromSearch}
        onInputChange={handleSearch}
        placeholder="Search or create employee..."
        disabled={disabled}
      />

      {selectedEmployee && (
        <div className="mt-2 p-3 bg-muted rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{selectedEmployee.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {selectedEmployee.position}
                {selectedEmployee.department && ` • ${selectedEmployee.department}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Checks: {selectedEmployee.totalDeviceChecks}
              </p>
            </div>
            {selectedEmployee.totalDeviceChecks > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`/data-pengecekan/${selectedEmployee._id}`}>
                  View History
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}

      <CreateEmployeeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateEmployee}
        initialData={createFormData}
      />
    </div>
  );
}

function CreateEmployeeModal({
  open,
  onOpenChange,
  onCreate,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (firstName: string, lastName: string, position: string, department: string) => void;
  initialData: { firstName: string; lastName: string; position: string; department: string };
}) {
  const [formData, setFormData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData.firstName, formData.lastName, formData.position, formData.department);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to the system. This will allow you to create device checks for them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., IT, HR, Marketing"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}