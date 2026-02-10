'use client';

import * as React from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchEmployees, createEmployee, type Employee } from '@/lib/services/employees.service';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [hasLoadedInitial, setHasLoadedInitial] = React.useState(false);
  const [dropdownOptions, setDropdownOptions] = React.useState<Record<string, SelectOption[]>>({});

  const debouncedSearch = useDebounce(searchTerm, 300);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Load initial employees on mount
  React.useEffect(() => {
    const loadInitialEmployees = async () => {
      setLoading(true);
      try {
        const response = await searchEmployees('', 10);
        if (response.success && response.data) {
          const employeeOptions = response.data.map((emp) => ({
            value: emp._id,
            label: `${emp.fullName} (${emp.employeeId}) - ${emp.position}`,
            employee: emp,
          }));
          setOptions(employeeOptions);
        }
      } catch (error: any) {
        console.error('Error loading initial employees:', error);
      } finally {
        setLoading(false);
        setHasLoadedInitial(true);
      }
    };

    loadInitialEmployees();
  }, []);

  // Fetch dropdown options on load
  React.useEffect(() => {
    const fetchDropdownOptions = async () => {
      const fields = ['position', 'department'];
      const options: Record<string, SelectOption[]> = {};

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        try {
          const response = await getDropdownOptions(field);
          if (response.success && response.data) {
            options[field] = response.data.map((opt) => ({
              value: opt.value,
              label: opt.value,
              _id: opt._id,
            }));
          }
        } catch (error) {
          console.error(`Error fetching ${field} options:`, error);
        }
      }

      setDropdownOptions(options);
    };

    fetchDropdownOptions();
  }, []);

  // Search employees when typing
  React.useEffect(() => {
    const searchEmployeesEffect = async () => {
      if (!hasLoadedInitial) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      if (!debouncedSearch) {
        setLoading(true);
        try {
          const response = await searchEmployees('', 10);
          if (response.success && response.data) {
            const employeeOptions = response.data.map((emp) => ({
              value: emp._id,
              label: `${emp.fullName} (${emp.employeeId}) - ${emp.position}`,
              employee: emp,
            }));
            setOptions(employeeOptions);
          }
        } catch (error: any) {
          console.error('Error searching employees:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await searchEmployees(debouncedSearch, 10);
        if (response.success && response.data) {
          const employeeOptions = response.data.map((emp) => ({
            value: emp._id,
            label: `${emp.fullName} (${emp.employeeId}) - ${emp.position}`,
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
  }, [debouncedSearch, hasLoadedInitial]);

  const handleEmployeeSelect = async (employeeId: string) => {
    const option = options.find((opt) => opt.value === employeeId);
    if (option && (option as any).employee) {
      setSelectedEmployee((option as any).employee);
    }
    onChange(employeeId);
  };

  const handleCreateEmployee = async (employeeId: string, firstName: string, lastName: string, position: string, department: string) => {
    try {
      const response = await createEmployee({
        employeeId: employeeId.trim().toUpperCase() || undefined,
        firstName,
        lastName,
        position,
        department: department || undefined,
        status: 'Active',
      });

      if (response.success && response.data) {
        toast.success(t('createEmployee.validation.createSuccess'));
        setIsCreateModalOpen(false);
        const empId = String(response.data._id);
        handleEmployeeSelect(empId);
      } else {
        toast.error(t('createEmployee.validation.createFailed'));
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast.error(error.message || t('createEmployee.validation.createFailed'));
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCreateFromSearch = (name: string) => {
    const names = name.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    setCreateFormData({
      employeeId: '',
      firstName,
      lastName,
      position: '',
      department: '',
    });
    setIsCreateModalOpen(true);
  };

  // Handle creating new dropdown option
  const handleCreateOption = async (fieldName: string, value: string) => {
    try {
      const normalizedValue = value.trim().toUpperCase();

      setDropdownOptions((prev) => {
        const currentOptions = prev[fieldName] || [];
        const optionExists = currentOptions.some((opt) => opt.value === normalizedValue);

        if (optionExists) {
          return prev;
        }

        return {
          ...prev,
          [fieldName]: [
            ...currentOptions,
            { value: normalizedValue, label: normalizedValue }
          ],
        };
      });

      toast.success(`"${normalizedValue}" ${t('form.toast.optionAdded')}`);

      saveDropdownOption(fieldName, normalizedValue)
        .then(() => {
          getDropdownOptions(fieldName).then((response) => {
            if (response.success && response.data) {
              setDropdownOptions((prev) => ({
                ...prev,
                [fieldName]: response.data!.map((opt: any) => ({
                  value: opt.value,
                  label: opt.value,
                  _id: opt._id,
                })),
              }));
            }
          });
        })
        .catch((error) => {
          console.error('Error saving option to backend:', error);
          toast.error(t('form.toast.optionSaveFailed'));
        });
    } catch (error) {
      console.error('Error creating option:', error);
      toast.error(t('createEmployee.validation.createFailed'));
    }
  };

  const [createFormData, setCreateFormData] = React.useState({
    employeeId: '',
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
        placeholder={t('form.employeeInfo.selectEmployee')}
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
                {t('employee.totalChecks')}: {selectedEmployee.totalDeviceChecks}
              </p>
            </div>
            {selectedEmployee.totalDeviceChecks > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`/data-pengecekan/${selectedEmployee._id}`}>
                  {t('employeeDetail.deviceChecks')}
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
        onCreateOption={handleCreateOption}
        initialData={createFormData}
        dropdownOptions={dropdownOptions}
      />
    </div>
  );
}

function CreateEmployeeModal({
  open,
  onOpenChange,
  onCreate,
  onCreateOption,
  initialData,
  dropdownOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (employeeId: string, firstName: string, lastName: string, position: string, department: string) => void;
  onCreateOption: (fieldName: string, value: string) => void;
  initialData: { employeeId: string; firstName: string; lastName: string; position: string; department: string };
  dropdownOptions: Record<string, SelectOption[]>;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.position) {
      toast.error(t('createEmployee.validation.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData.employeeId, formData.firstName, formData.lastName, formData.position, formData.department);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createEmployee.formTitle')}</DialogTitle>
          <DialogDescription>
            {t('createEmployee.formDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">{t('employee.employeeId')}</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value.toUpperCase())}
                placeholder={t('createEmployee.placeholders.employeeId')}
              />
              <p className="text-xs text-muted-foreground">
                {t('createEmployee.employeeIdHint')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('createEmployee.firstName')} {t('createEmployee.required')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  placeholder={t('createEmployee.placeholders.firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('createEmployee.lastName')} {t('createEmployee.required')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  placeholder={t('createEmployee.placeholders.lastName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t('createEmployee.position')} {t('createEmployee.required')}</Label>
              <CreatableSelect
                key="position"
                options={dropdownOptions['position'] || []}
                value={formData.position}
                onChange={(val) => handleInputChange('position', val)}
                onCreate={(val) => onCreateOption('position', val)}
                placeholder={t('createEmployee.placeholders.position')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">{t('createEmployee.department')}</Label>
              <CreatableSelect
                key="department"
                options={dropdownOptions['department'] || []}
                value={formData.department}
                onChange={(val) => handleInputChange('department', val)}
                onCreate={(val) => onCreateOption('department', val)}
                placeholder={t('createEmployee.placeholders.department')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('createEmployee.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('createEmployee.creating') : t('createEmployee.createButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}