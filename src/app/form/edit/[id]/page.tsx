'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDeviceCheckById, updateDeviceCheck, type DeviceCheck } from '@/lib/services/device-checks.service';
import { normalizeDataForSubmission } from '@/lib/utils/data-normalizer';
import EmployeeAutocomplete from '@/components/EmployeeAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableSelect, type SelectOption } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2, Save, User, Laptop, HardDrive, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
import { getEmployeeById } from '@/lib/services/employees.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalizeDataForForm } from '@/lib/utils/data-normalizer';

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const checkId = params.id as string;
  const { t, language } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
  const [dropdownOptions, setDropdownOptions] = React.useState<Record<string, SelectOption[]>>({});

  const { register, control, watch, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      employeeId: '',
      checkDate: new Date().toISOString().split('T')[0],
      deviceDetail: {
        deviceType: 'laptop',
        ownership: 'company',
        deviceBrand: '',
        deviceModel: '',
        serialNumber: '',
      },
      operatingSystem: {
        osType: 'windows',
        osVersion: '',
        osLicense: 'original',
        osRegularUpdate: true,
      },
      specification: {
        ramCapacity: '',
        memoryType: 'hdd',
        memoryCapacity: '',
        processor: '',
      },
      deviceCondition: {
        deviceSuitability: 'suitable',
        batterySuitability: 'Good',
        keyboardCondition: 'Good',
        touchpadCondition: 'Good',
        monitorCondition: 'Good',
        wifiCondition: 'Good',
      },
      workApplications: [] as any,
      nonWorkApplications: [] as any,
      security: {
        antivirus: {
          status: 'active',
          list: [] as any,
        },
        vpn: {
          status: 'available',
          list: [] as any,
        },
      },
      additionalInfo: {
        passwordUsage: 'available',
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
    { id: 'employee', title: t('form.sections.employee'), icon: User },
    { id: 'device', title: t('form.sections.deviceDetail'), icon: Laptop },
    { id: 'os', title: t('form.sections.operatingSystem'), icon: HardDrive },
    { id: 'spec', title: t('form.sections.specification'), icon: HardDrive },
    { id: 'condition', title: t('form.sections.deviceCondition'), icon: Shield },
    { id: 'apps', title: t('form.sections.applications'), icon: Shield },
    { id: 'security', title: t('form.sections.security'), icon: Shield },
    { id: 'info', title: t('form.sections.additionalInfo'), icon: Calendar },
  ];

  // Fetch check data on load
  React.useEffect(() => {
    fetchCheckData();
  }, [checkId]);

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
            options[field] = response.data.map((opt) => ({
              value: opt.value,
              label: opt.value,
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

  const fetchCheckData = async () => {
    setLoading(true);
    try {
      // Ensure checkId is a string
      const idStr = String(checkId);
      const response = await getDeviceCheckById(idStr);
      if (response.success && response.data) {
        // Normalize old data format to new internal values
        const normalizedCheck = normalizeDataForForm(response.data);
        
        // Pre-fill form with normalized check data
        reset({
          employeeId: normalizedCheck.employeeId.toString(),
          checkDate: normalizedCheck.checkDate ? normalizedCheck.checkDate.split('T')[0] : new Date().toISOString().split('T')[0],
          deviceDetail: normalizedCheck.deviceDetail,
          operatingSystem: normalizedCheck.operatingSystem,
          specification: normalizedCheck.specification || {
            ramCapacity: '',
            memoryType: 'hdd',
            memoryCapacity: '',
            processor: '',
          },
          deviceCondition: normalizedCheck.deviceCondition,
          workApplications: normalizedCheck.workApplications,
          nonWorkApplications: normalizedCheck.nonWorkApplications,
          security: normalizedCheck.security,
          additionalInfo: normalizedCheck.additionalInfo,
        });

        // Fetch employee data
        if (normalizedCheck.employeeId) {
          const empResponse = await getEmployeeById(normalizedCheck.employeeId.toString());
          if (empResponse.success && empResponse.data) {
            setSelectedEmployee(empResponse.data);
          }
        }
      } else {
        toast.error('Failed to load device check');
        router.push('/data-pengecekan');
      }
    } catch (error: any) {
      console.error('Error fetching check:', error);
      toast.error(error.message || 'Failed to load device check');
      router.push('/data-pengecekan');
    } finally {
      setLoading(false);
    }
  };

  // Handle employee selection (disabled in edit mode)
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
      
      // Immediately update local state with new option (optimistic update)
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
              setDropdownOptions((prev) => ({
                ...prev,
                [fieldName]: response.data!.map((opt: any) => ({
                  value: opt.value,
                  label: opt.value,
                })),
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
      toast.error('Employee ID is required');
      return;
    }

    setSaving(true);
    try {
      // Ensure checkId is a string
      const idStr = String(checkId);
      
      // Remove employeeId from update payload (cannot be changed after creation)
      const { employeeId, ...updateData } = data;
      
      // Normalize data to match database enum values
      const normalizedData = normalizeDataForSubmission(updateData);
      
      const response = await updateDeviceCheck(idStr, normalizedData);
      if (response.success && response.data) {
        toast.success('Device check updated successfully');
        router.push('/data-pengecekan');
      } else {
        toast.error('Failed to update device check');
      }
    } catch (error: any) {
      console.error('Error updating form:', error);
      toast.error(error.message || 'Failed to update device check');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading device check...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-3xl font-bold mb-2">{t('form.title')}</h1>
        <p className="text-muted-foreground">
          {t('form.description')}
        </p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Progress Indicator (Desktop) */}
        <aside className="hidden lg:block sticky top-20 h-fit space-y-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </a>
          ))}
        </aside>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee Section */}
          <Card id="employee">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('form.employeeInfo.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Employee selector disabled in edit mode */}
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  Employee cannot be changed after check is created
                </p>
                <EmployeeAutocomplete
                  value={watch('employeeId')}
                  onChange={handleEmployeeSelect}
                  error={errors.employeeId?.message as string}
                  disabled
                />
              </div>

              {selectedEmployee && (
                <div className="p-4 bg-muted rounded-md">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">{t('form.employeeInfo.fullName')}</Label>
                      <p className="font-medium">{selectedEmployee.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('form.employeeInfo.position')}</Label>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>
                    {selectedEmployee.department && (
                      <div>
                        <Label className="text-muted-foreground">{t('form.employeeInfo.department')}</Label>
                        <p className="font-medium">{selectedEmployee.department}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">{t('form.employeeInfo.totalChecks')}</Label>
                      <p className="font-medium">{selectedEmployee.totalDeviceChecks}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="checkDate">{t('form.employeeInfo.checkDate')} *</Label>
                <Input
                  id="checkDate"
                  type="date"
                  {...register('checkDate', { required: t('form.validation.checkDateRequired') })}
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
                {t('form.deviceDetail.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceType">{t('form.deviceDetail.deviceType')} *</Label>
                  <select
                    id="deviceType"
                    {...register('deviceDetail.deviceType', { required: t('form.validation.deviceTypeRequired') })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="pc">{t('form.deviceDetail.deviceTypeOptions.pc')}</option>
                    <option value="laptop">{t('form.deviceDetail.deviceTypeOptions.laptop')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ownership">{t('form.deviceDetail.ownership')} *</Label>
                  <select
                    id="ownership"
                    {...register('deviceDetail.ownership', { required: t('form.validation.ownershipRequired') })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="company">{t('form.deviceDetail.ownershipOptions.company')}</option>
                    <option value="personal">{t('form.deviceDetail.ownershipOptions.personal')}</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="deviceBrand">{t('form.deviceDetail.deviceBrand')} *</Label>
                <CreatableSelect
                  key="deviceBrand"
                  options={dropdownOptions['deviceBrand'] || []}
                  value={watch('deviceDetail.deviceBrand')}
                  onChange={(val) => setValue('deviceDetail.deviceBrand', val)}
                  onCreate={(val) => handleCreateOption('deviceBrand', val)}
                  placeholder={t('form.placeholders.deviceBrand')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceModel">{t('form.deviceDetail.deviceModel')} *</Label>
                  <Input
                    id="deviceModel"
                    {...register('deviceDetail.deviceModel', { required: t('form.validation.deviceModelRequired') })}
                  />
                </div>
                <div>
                  <Label htmlFor="serialNumber">{t('form.deviceDetail.serialNumber')} *</Label>
                  <Input
                    id="serialNumber"
                    {...register('deviceDetail.serialNumber', { required: t('form.validation.serialNumberRequired') })}
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
                {t('form.operatingSystem.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="osType">{t('form.operatingSystem.osType')} *</Label>
                  <select
                    id="osType"
                    {...register('operatingSystem.osType', { required: t('form.validation.osTypeRequired') })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="windows">{t('form.operatingSystem.osTypeOptions.windows')}</option>
                    <option value="linux">{t('form.operatingSystem.osTypeOptions.linux')}</option>
                    <option value="mac">{t('form.operatingSystem.osTypeOptions.mac')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="osVersion">{t('form.operatingSystem.osVersion')} *</Label>
                  <Input
                    id="osVersion"
                    {...register('operatingSystem.osVersion', { required: t('form.validation.osVersionRequired') })}
                    placeholder={t('form.placeholders.osVersion')}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="osLicense">{t('form.operatingSystem.osLicense')} *</Label>
                  <select
                    id="osLicense"
                    {...register('operatingSystem.osLicense', { required: t('form.validation.osLicenseRequired') })}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="original">{t('form.operatingSystem.osLicenseOptions.original')}</option>
                    <option value="pirated">{t('form.operatingSystem.osLicenseOptions.pirated')}</option>
                    <option value="openSource">{t('form.operatingSystem.osLicenseOptions.openSource')}</option>
                    <option value="unknown">{t('form.operatingSystem.osLicenseOptions.unknown')}</option>
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
                    {t('form.operatingSystem.regularUpdates')}
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
                {t('form.specification.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ramCapacity">{t('form.specification.ramCapacity')}</Label>
                  <CreatableSelect
                    key="ramCapacity"
                    options={dropdownOptions['ramCapacity'] || []}
                    value={watch('specification.ramCapacity')}
                    onChange={(val) => setValue('specification.ramCapacity', val)}
                    onCreate={(val) => handleCreateOption('ramCapacity', val)}
                    placeholder={t('form.placeholders.ramCapacity')}
                  />
                </div>
                <div>
                  <Label htmlFor="memoryType">{t('form.specification.memoryType')}</Label>
                  <select
                    id="memoryType"
                    {...register('specification.memoryType')}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="hdd">{t('form.specification.memoryTypeOptions.hdd')}</option>
                    <option value="ssd">{t('form.specification.memoryTypeOptions.ssd')}</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memoryCapacity">{t('form.specification.storageCapacity')}</Label>
                  <CreatableSelect
                    key="memoryCapacity"
                    options={dropdownOptions['memoryCapacity'] || []}
                    value={watch('specification.memoryCapacity')}
                    onChange={(val) => setValue('specification.memoryCapacity', val)}
                    onCreate={(val) => handleCreateOption('memoryCapacity', val)}
                    placeholder={t('form.placeholders.storageCapacity')}
                  />
                </div>
                <div>
                  <Label htmlFor="processor">{t('form.specification.processor')}</Label>
                  <CreatableSelect
                    key="processor"
                    options={dropdownOptions['processor'] || []}
                    value={watch('specification.processor')}
                    onChange={(val) => setValue('specification.processor', val)}
                    onCreate={(val) => handleCreateOption('processor', val)}
                    placeholder={t('form.placeholders.processor')}
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
                {t('form.deviceCondition.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deviceSuitability">{t('form.deviceCondition.deviceSuitability')} *</Label>
                <select
                  id="deviceSuitability"
                  {...register('deviceCondition.deviceSuitability', { required: t('form.validation.deviceSuitabilityRequired') })}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="suitable">{t('form.deviceCondition.suitabilityOptions.suitable')}</option>
                  <option value="limitedSuitability">{t('form.deviceCondition.suitabilityOptions.limitedSuitability')}</option>
                  <option value="needsRepair">{t('form.deviceCondition.suitabilityOptions.needsRepair')}</option>
                  <option value="unsuitable">{t('form.deviceCondition.suitabilityOptions.unsuitable')}</option>
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
                {t('form.applications.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Work Applications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>{t('form.applications.workApplications')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendWorkApp({ applicationName: '', license: 'original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('common.add')}
                  </Button>
                </div>
                {workAppFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder={t('form.applications.applicationName')}
                      {...register(`workApplications.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`workApplications.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="original">{t('form.applications.licenseOptions.original')}</option>
                      <option value="pirated">{t('form.applications.licenseOptions.pirated')}</option>
                      <option value="openSource">{t('form.applications.licenseOptions.openSource')}</option>
                      <option value="unknown">{t('form.applications.licenseOptions.unknown')}</option>
                    </select>
                    <Input
                      placeholder={t('form.applications.notesPlaceholder')}
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
                  <Label>{t('form.applications.nonWorkApplications')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendNonWorkApp({ applicationName: '', license: 'original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('common.add')}
                  </Button>
                </div>
                {nonWorkAppFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder={t('form.applications.applicationName')}
                      {...register(`nonWorkApplications.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`nonWorkApplications.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="original">{t('form.applications.licenseOptions.original')}</option>
                      <option value="pirated">{t('form.applications.licenseOptions.pirated')}</option>
                      <option value="openSource">{t('form.applications.licenseOptions.openSource')}</option>
                      <option value="unknown">{t('form.applications.licenseOptions.unknown')}</option>
                    </select>
                    <Input
                      placeholder={t('form.applications.notesPlaceholder')}
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
                {t('form.security.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Antivirus */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>{t('form.security.antivirus')}</Label>
                  <select
                    {...register('security.antivirus.status')}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="active">{t('form.security.statusOptions.active')}</option>
                    <option value="inactive">{t('form.security.statusOptions.inactive')}</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-full"></div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAntivirus({ applicationName: '', license: 'original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('common.add')}
                  </Button>
                </div>
                {antivirusFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder={t('form.applications.applicationName')}
                      {...register(`security.antivirus.list.${index}.applicationName` as any)}
                    />
                    <select
                      {...register(`security.antivirus.list.${index}.license` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="original">{t('form.applications.licenseOptions.original')}</option>
                      <option value="pirated">{t('form.applications.licenseOptions.pirated')}</option>
                      <option value="openSource">{t('form.applications.licenseOptions.openSource')}</option>
                      <option value="unknown">{t('form.applications.licenseOptions.unknown')}</option>
                    </select>
                    <Input
                      placeholder={t('form.applications.notesPlaceholder')}
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
                  <Label>{t('form.security.vpn')}</Label>
                  <select
                    {...register('security.vpn.status')}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="available">{t('form.security.statusOptions.available')}</option>
                    <option value="notAvailable">{t('form.security.statusOptions.notAvailable')}</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-full"></div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendVpn({ vpnName: '', license: 'original', notes: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('common.add')}
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
                      <option value="original">{t('form.applications.licenseOptions.original')}</option>
                      <option value="pirated">{t('form.applications.licenseOptions.pirated')}</option>
                      <option value="openSource">{t('form.applications.licenseOptions.openSource')}</option>
                      <option value="unknown">{t('form.applications.licenseOptions.unknown')}</option>
                    </select>
                    <Input
                      placeholder={t('form.applications.notesPlaceholder')}
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
                {t('form.additionalInfo.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passwordUsage">{t('form.additionalInfo.passwordUsage')} *</Label>
                <select
                  id="passwordUsage"
                  {...register('additionalInfo.passwordUsage', { required: t('form.validation.passwordUsageRequired') })}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="available">{t('form.additionalInfo.passwordUsageOptions.available')}</option>
                  <option value="notAvailable">{t('form.additionalInfo.passwordUsageOptions.notAvailable')}</option>
                </select>
              </div>

              <div>
                <Label htmlFor="inspectorPICName">{t('form.additionalInfo.inspectorPICName')}</Label>
                <CreatableSelect
                  key="inspectorPICName"
                  options={dropdownOptions['inspectorPICName'] || []}
                  value={watch('additionalInfo.inspectorPICName')}
                  onChange={(val) => setValue('additionalInfo.inspectorPICName', val)}
                  onCreate={(val) => handleCreateOption('inspectorPICName', val)}
                  placeholder={t('form.placeholders.inspectorName')}
                />
              </div>

              <div>
                <Label htmlFor="otherNotes">{t('form.additionalInfo.otherNotes')}</Label>
                <textarea
                  id="otherNotes"
                  {...register('additionalInfo.otherNotes')}
                  onKeyDown={handleKeyDown}
                  className="flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={t('form.placeholders.otherNotes')}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Press Enter to save, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}