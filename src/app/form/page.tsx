'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createDeviceCheck, type DeviceCheck } from '@/lib/services/device-checks.service';
import EmployeeAutocomplete from '@/components/EmployeeAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableSelect, type SelectOption } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2, Save, User, Laptop, HardDrive, Shield, Calendar } from 'lucide-react';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
import { getEmployeeById } from '@/lib/services/employees.service';

export default function FormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
  const [dropdownOptions, setDropdownOptions] = React.useState<Record<string, SelectOption[]>>({});

  // Handle URL params for pre-filling employee
  React.useEffect(() => {
    const employeeIdFromUrl = searchParams.get('employeeId');
    if (employeeIdFromUrl) {
      setValue('employeeId', employeeIdFromUrl);
      handleEmployeeSelect(employeeIdFromUrl);
    }
  }, [searchParams]);

  const { register, control, watch, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      employeeId: '',
      checkDate: new Date().toISOString().split('T')[0],
      deviceDetail: {
        deviceType: 'Laptop',
        ownership: 'Company',
        deviceBrand: '',
        deviceModel: '',
        serialNumber: '',
      },
      operatingSystem: {
        osType: 'Windows',
        osVersion: '',
        osLicense: 'Original',
        osRegularUpdate: true,
      },
      specification: {
        ramCapacity: '',
        memoryType: 'HDD',
        memoryCapacity: '',
        processor: '',
      },
      deviceCondition: {
        deviceSuitability: 'Suitable',
        batterySuitability: 'Good',
        keyboardCondition: 'Good',
        touchpadCondition: 'Good',
        monitorCondition: 'Good',
        wifiCondition: 'Good',
      },
      workApplications: [],
      nonWorkApplications: [],
      security: {
        antivirus: {
          status: 'Active',
          list: [],
        },
        vpn: {
          status: 'Available',
          list: [],
        },
      },
      additionalInfo: {
        passwordUsage: 'Available',
        otherNotes: '',
        inspectorPICName: '',
      },
    },
  });

  const {
    fields: workAppFields,
    append: appendWorkApp,
    remove: removeWorkApp,
  } = useFieldArray({ control, name: 'workApplications' });

  const {
    fields: nonWorkAppFields,
    append: appendNonWorkApp,
    remove: removeNonWorkApp,
  } = useFieldArray({ control, name: 'nonWorkApplications' });

  const {
    fields: antivirusFields,
    append: appendAntivirus,
    remove: removeAntivirus,
  } = useFieldArray({ control, name: 'security.antivirus.list' });

  const {
    fields: vpnFields,
    append: appendVpn,
    remove: removeVpn,
  } = useFieldArray({ control, name: 'security.vpn.list' });

  const sections = [
    { id: 'employee', title: 'Employee', icon: User },
    { id: 'device', title: 'Device Detail', icon: Laptop },
    { id: 'os', title: 'Operating System', icon: HardDrive },
    { id: 'spec', title: 'Specification', icon: HardDrive },
    { id: 'condition', title: 'Device Condition', icon: Shield },
    { id: 'apps', title: 'Applications', icon: Shield },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'info', title: 'Additional Info', icon: Calendar },
  ];

  // Fetch dropdown options
  React.useEffect(() => {
    const fetchDropdownOptions = async () => {
      const fields = [
        'deviceBrand',
        'ramCapacity',
        'memoryCapacity',
        'processor',
        'applicationName',
        'vpnName',
        'inspectorPICName',
      ];

      const options: Record<string, SelectOption[]> = {};

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        try {
          const response = await getDropdownOptions(field);
          if (response.success && response.data) {
            const mappedOptions: SelectOption[] = response.data.map((opt) => ({
              value: opt.value,
              label: opt.value,
            }));
            options[field] = mappedOptions;
          }
        } catch (error) {
          console.error(`Error fetching ${field} options:`, error);
        }
      }

      setDropdownOptions(options);
    };

    fetchDropdownOptions();
  }, []);

  // Handle employee selection
  const handleEmployeeSelect = async (employeeId: string) => {
    setValue('employeeId', employeeId);

    try {
      const response = await getEmployeeById(employeeId);
      if (response.success && response.data) {
        setSelectedEmployee(response.data);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    }
  };

  // Handle creating new dropdown option
  const handleCreateOption = async (fieldName: string, value: string, category?: string) => {
    try {
      // Convert to uppercase
      const normalizedValue = value.trim().toUpperCase();

      // Immediately update local state with the new option (optimistic update)
      setDropdownOptions((prev) => {
        const currentOptions = prev[fieldName] || [];
        const optionExists = currentOptions.some((opt) => opt.value === normalizedValue);

        if (optionExists) {
          return prev; // Don't add duplicate
        }

        return {
          ...prev,
          [fieldName]: [
            ...currentOptions,
            { value: normalizedValue, label: normalizedValue }
          ],
        };
      });

      toast.success(`"${normalizedValue}" added successfully`);

      // Save to backend in background (don't await)
      saveDropdownOption(fieldName, normalizedValue, category)
        .then(() => {
          // Refresh from server after successful save to get updated usage counts
          getDropdownOptions(fieldName).then((response) => {
            if (response.success && response.data) {
              const mappedOptions: SelectOption[] = response.data.map((opt) => ({
                value: opt.value,
                label: opt.value,
              }));
              setDropdownOptions((prev) => ({
                ...prev,
                [fieldName]: mappedOptions,
              }));
            }
          });
        })
        .catch((error) => {
          console.error('Error saving option to backend:', error);
          toast.error('Failed to save option to database');
        });
    } catch (error) {
      console.error('Error creating option:', error);
      toast.error('Failed to create option');
    }
  };

  const onSubmit = async (data: any) => {
    if (!data.employeeId) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const response = await createDeviceCheck(data);
      if (response.success && response.data) {
        toast.success('Device check created successfully');
        router.push('/data-pengecekan');
      } else {
        toast.error('Failed to create device check');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to create device check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Device Checking Form</h1>
        <p className="text-muted-foreground">
          Fill in device checking information below
        </p>
      </div>

      {/* Form with Sidebar Navigation */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block sticky top-24 h-fit space-y-1">
          <p className="text-sm font-medium text-muted-foreground mb-3">Form Sections</p>
          <nav className="space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee Section */}
          <Card id="employee">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmployeeAutocomplete
                value={watch('employeeId')}
                onChange={handleEmployeeSelect}
                error={errors.employeeId?.message as string}
              />

              {selectedEmployee && (
                <div className="p-4 bg-muted rounded-md">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{selectedEmployee.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Position</Label>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    {selectedEmployee.department && (
                      <div>
                        <Label className="text-muted-foreground">Department</Label>
                        <p className="font-medium">{selectedEmployee.department}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Total Checks</Label>
                      <p className="font-medium">{selectedEmployee.totalDeviceChecks}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="checkDate">Check Date *</Label>
                <Input
                  id="checkDate"
                  type="date"
                  {...register('checkDate', { required: 'Check date is required' })}
                />
                {errors.checkDate?.message && (
                  <p className="text-sm text-destructive mt-1">{errors.checkDate.message as string}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Detail Section */}
          <Card id="device">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Device Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <select
                    id="deviceType"
                    {...register('deviceDetail.deviceType', { required: 'Device type is required' })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="PC">PC</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ownership">Ownership *</Label>
                  <select
                    id="ownership"
                    {...register('deviceDetail.ownership', { required: 'Ownership is required' })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="Company">Company</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="deviceBrand">Device Brand *</Label>
                <CreatableSelect
                  key="deviceBrand"
                  options={dropdownOptions['deviceBrand'] || []}
                  value={watch('deviceDetail.deviceBrand')}
                  onChange={(val) => setValue('deviceDetail.deviceBrand', val)}
                  onCreate={(val) => handleCreateOption('deviceBrand', val)}
                  placeholder="Select or create device brand..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceModel">Device Model *</Label>
                  <Input
                    id="deviceModel"
                    {...register('deviceDetail.deviceModel', { required: 'Device model is required' })}
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    {...register('deviceDetail.serialNumber', { required: 'Serial number is required' })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating System Section */}
          <Card id="os">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Operating System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="osType">OS Type *</Label>
                  <select
                    id="osType"
                    {...register('operatingSystem.osType', { required: 'OS type is required' })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="Windows">Windows</option>
                    <option value="Linux">Linux</option>
                    <option value="Mac">Mac</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="osVersion">OS Version *</Label>
                  <Input
                    id="osVersion"
                    {...register('operatingSystem.osVersion', { required: 'OS version is required' })}
                    placeholder="e.g., Windows 11, Ubuntu 22.04, macOS Sonoma"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="osLicense">OS License *</Label>
                  <select
                    id="osLicense"
                    {...register('operatingSystem.osLicense', { required: 'OS license is required' })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="Original">Original</option>
                    <option value="Pirated">Pirated</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="osRegularUpdate"
                    {...register('operatingSystem.osRegularUpdate')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="osRegularUpdate" className="cursor-pointer">
                    Regular Updates Enabled
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specification Section */}
          <Card id="spec">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Specification (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ramCapacity">RAM Capacity</Label>
                  <CreatableSelect
                    key="ramCapacity"
                    options={dropdownOptions['ramCapacity'] || []}
                    value={watch('specification.ramCapacity')}
                    onChange={(val) => setValue('specification.ramCapacity', val)}
                    onCreate={(val) => handleCreateOption('ramCapacity', val)}
                    placeholder="Select or create RAM capacity..."
                  />
                </div>
                <div>
                  <Label htmlFor="memoryType">Memory Type</Label>
                  <select
                    id="memoryType"
                    {...register('specification.memoryType')}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="HDD">HDD</option>
                    <option value="SSD">SSD</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memoryCapacity">Storage Capacity</Label>
                  <CreatableSelect
                    key="memoryCapacity"
                    options={dropdownOptions['memoryCapacity'] || []}
                    value={watch('specification.memoryCapacity')}
                    onChange={(val) => setValue('specification.memoryCapacity', val)}
                    onCreate={(val) => handleCreateOption('memoryCapacity', val)}
                    placeholder="Select or create storage capacity..."
                  />
                </div>
                <div>
                  <Label htmlFor="processor">Processor</Label>
                  <CreatableSelect
                    key="processor"
                    options={dropdownOptions['processor'] || []}
                    value={watch('specification.processor')}
                    onChange={(val) => setValue('specification.processor', val)}
                    onCreate={(val) => handleCreateOption('processor', val)}
                    placeholder="Select or create processor..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Condition Section */}
          <Card id="condition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Device Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deviceSuitability">Device Suitability *</Label>
                <select
                  id="deviceSuitability"
                  {...register('deviceCondition.deviceSuitability', { required: 'Device suitability is required' })}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Suitable">Suitable</option>
                  <option value="Limited Suitability">Limited Suitability</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Unsuitable">Unsuitable</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="batterySuitability">Battery</Label>
                  <Input
                    id="batterySuitability"
                    {...register('deviceCondition.batterySuitability')}
                    placeholder="e.g., Good, Fair, Poor"
                  />
                </div>
                <div>
                  <Label htmlFor="keyboardCondition">Keyboard</Label>
                  <Input
                    id="keyboardCondition"
                    {...register('deviceCondition.keyboardCondition')}
                    placeholder="e.g., Good, Fair, Poor"
                  />
                </div>
                <div>
                  <Label htmlFor="touchpadCondition">Touchpad</Label>
                  <Input
                    id="touchpadCondition"
                    {...register('deviceCondition.touchpadCondition')}
                    placeholder="e.g., Good, Fair, Poor"
                  />
                </div>
                <div>
                  <Label htmlFor="monitorCondition">Monitor</Label>
                  <Input
                    id="monitorCondition"
                    {...register('deviceCondition.monitorCondition')}
                    placeholder="e.g., Good, Fair, Poor"
                  />
                </div>
                <div>
                  <Label htmlFor="wifiCondition">WiFi</Label>
                  <Input
                    id="wifiCondition"
                    {...register('deviceCondition.wifiCondition')}
                    placeholder="e.g., Good, Fair, Poor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Section */}
          <Card id="apps">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Work Applications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Work Applications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendWorkApp({ applicationName: '', license: 'Original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {workAppFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder="Application name"
                      {...register(`workApplications.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`workApplications.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="Original">Original</option>
                      <option value="Pirated">Pirated</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <Input
                      placeholder="Notes (optional)"
                      {...register(`workApplications.${index}.notes` as any)}
                    />
                    {workAppFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkApp(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Non-Work Applications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Non-Work Applications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendNonWorkApp({ applicationName: '', license: 'Original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {nonWorkAppFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder="Application name"
                      {...register(`nonWorkApplications.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`nonWorkApplications.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="Original">Original</option>
                      <option value="Pirated">Pirated</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <Input
                      placeholder="Notes (optional)"
                      {...register(`nonWorkApplications.${index}.notes` as any)}
                    />
                    {nonWorkAppFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNonWorkApp(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Antivirus */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Antivirus Software</Label>
                  <select
                    {...register('security.antivirus.status')}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-full"></div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAntivirus({ applicationName: '', license: 'Original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {antivirusFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder="Antivirus name"
                      {...register(`security.antivirus.list.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`security.antivirus.list.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="Original">Original</option>
                      <option value="Pirated">Pirated</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <Input
                      placeholder="Notes (optional)"
                      {...register(`security.antivirus.list.${index}.notes` as any)}
                    />
                    {antivirusFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAntivirus(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* VPN */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>VPN Software</Label>
                  <select
                    {...register('security.vpn.status')}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-full"></div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendVpn({ vpnName: '', license: 'Original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {vpnFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder="VPN name"
                      {...register(`security.vpn.list.${index}.vpnName` as any)}
                    />
                    <select
                      {...register(`security.vpn.list.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="Original">Original</option>
                      <option value="Pirated">Pirated</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <Input
                      placeholder="Notes (optional)"
                      {...register(`security.vpn.list.${index}.notes` as any)}
                    />
                    {vpnFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVpn(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Section */}
          <Card id="info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passwordUsage">Password Usage *</Label>
                <select
                  id="passwordUsage"
                  {...register('additionalInfo.passwordUsage', { required: 'Password usage is required' })}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <Label htmlFor="inspectorPICName">Inspector PIC Name</Label>
                <CreatableSelect
                  key="inspectorPICName"
                  options={dropdownOptions['inspectorPICName'] || []}
                  value={watch('additionalInfo.inspectorPICName')}
                  onChange={(val) => setValue('additionalInfo.inspectorPICName', val)}
                  onCreate={(val) => handleCreateOption('inspectorPICName', val)}
                  placeholder="Select or create inspector name..."
                />
              </div>

              <div>
                <Label htmlFor="otherNotes">Other Notes</Label>
                <textarea
                  id="otherNotes"
                  {...register('additionalInfo.otherNotes')}
                  className="flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Device Check'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
