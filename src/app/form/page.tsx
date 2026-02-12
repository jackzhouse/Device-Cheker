'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createDeviceCheck, getEmployeeChecks, type DeviceCheck } from '@/lib/services/device-checks.service';
import { normalizeDataForSubmission } from '@/lib/utils/data-normalizer';
import EmployeeAutocomplete from '@/components/EmployeeAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableSelect, type SelectOption } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useFieldArray, useForm, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Save, User, Laptop, HardDrive, Shield, Calendar, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
import { getEmployeeById } from '@/lib/services/employees.service';
import { useLanguage } from '@/contexts/LanguageContext';

type ApplicationItem = {
  applicationName?: string;
  license?: string;
  notes?: string;
};

type VPNItem = {
  vpnName?: string;
  license?: string;
  notes?: string;
};

type StorageItem = {
  type: string;
  size: string;
};

type FormData = {
  employeeId: string;
  checkDate: string;
  deviceDetail: {
    deviceType: string;
    ownership: string;
    deviceBrand: string;
    deviceModel: string;
    serialNumber: string;
  };
  operatingSystem: {
    osType: string;
    osVersion: string;
    osLicense: string;
    osRegularUpdate: boolean;
  };
  specification: {
    ramCapacity: string;
    storage: StorageItem[];
    processor: string;
  };
  deviceCondition: {
    deviceSuitability: string;
    batterySuitability: string;
    keyboardCondition: string;
    touchpadCondition: string;
    monitorCondition: string;
    wifiCondition: string;
  };
  workApplications: ApplicationItem[];
  nonWorkApplications: ApplicationItem[];
  security: {
    antivirus: {
      status: string;
      list: ApplicationItem[];
    };
    vpn: {
      status: string;
      list: VPNItem[];
    };
  };
  additionalInfo: {
    passwordUsage: string;
    otherNotes: string;
    inspectorPICName: string;
  };
};

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const [loading, setLoading] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
  const [dropdownOptions, setDropdownOptions] = React.useState<Record<string, SelectOption[]>>({});
  const [useLastVersion, setUseLastVersion] = React.useState(false);
  const [loadingLastVersion, setLoadingLastVersion] = React.useState(false);

  const { register, control, watch, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
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
        storage: [],
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
      workApplications: [],
      nonWorkApplications: [],
      security: {
        antivirus: {
          status: 'active',
          list: [],
        },
        vpn: {
          status: 'available',
          list: [],
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
    replace: replaceWorkApp,
  } = useFieldArray({ control, name: 'workApplications' });

  const {
    fields: nonWorkAppFields,
    append: appendNonWorkApp,
    remove: removeNonWorkApp,
    replace: replaceNonWorkApp,
  } = useFieldArray({ control, name: 'nonWorkApplications' });

  const {
    fields: antivirusFields,
    append: appendAntivirus,
    remove: removeAntivirus,
    replace: replaceAntivirus,
  } = useFieldArray({ control, name: 'security.antivirus.list' });

  const {
    fields: vpnFields,
    append: appendVpn,
    remove: removeVpn,
    replace: replaceVpn,
  } = useFieldArray({ control, name: 'security.vpn.list' });

  const {
    fields: storageFields,
    append: appendStorage,
    remove: removeStorage,
  } = useFieldArray({ control, name: 'specification.storage' });

  // Handle URL params for pre-filling employee
  React.useEffect(() => {
    const employeeIdFromUrl = searchParams.get('employeeId');
    if (employeeIdFromUrl) {
      setValue('employeeId', employeeIdFromUrl);
      handleEmployeeSelect(employeeIdFromUrl);
    }
  }, [searchParams, setValue]);


  const sections = [
    { id: 'employee', title: t('form.sections.employee'), icon: User },
    { id: 'device', title: t('form.sections.deviceDetail'), icon: Laptop },
    { id: 'os', title: t('form.sections.operatingSystem'), icon: HardDrive },
    { id: 'spec', title: t('form.sections.specification'), icon: HardDrive },
    { id: 'condition', title: t('form.sections.deviceCondition'), icon: Shield },
    { id: 'apps', title: t('form.sections.applications'), icon: Shield },
    { id: 'security', title: t('form.sections.security'), icon: Shield },
    { id: 'info', title: t('form.sections.additionalInfo'), icon: Calendar },
  ] as const;

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
              _id: opt._id,
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
    setUseLastVersion(false)
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

      toast.success(`"${normalizedValue}" ${t('form.toast.optionAdded')}`);

      // Save to backend in background (don't await)
      saveDropdownOption(fieldName, normalizedValue, category)
        .then(() => {
          // Refresh from server after successful save to get updated usage counts
          getDropdownOptions(fieldName).then((response) => {
            if (response.success && response.data) {
              const mappedOptions: SelectOption[] = response.data.map((opt) => ({
                value: opt.value,
                label: opt.value,
                _id: opt._id,
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
          toast.error(t('form.toast.optionSaveFailed'));
        });
    } catch (error) {
      console.error('Error creating option:', error);
      toast.error('Failed to create option');
    }
  };

  // Handle deleting dropdown option
  const handleDeleteOption = (fieldName: string) => {
    return (optionId: string) => {
      setDropdownOptions((prev) => {
        const currentOptions = prev[fieldName] || [];
        const filteredOptions = currentOptions.filter((opt) => opt._id !== optionId);
        return {
          ...prev,
          [fieldName]: filteredOptions,
        };
      });
    };
  };

  // Fetch and populate form with last check data
  React.useEffect(() => {
    const fetchLastVersionData = async () => {
      if (!useLastVersion || !selectedEmployee?._id) {
        return;
      }

      setLoadingLastVersion(true);
      try {
        const response = await getEmployeeChecks(selectedEmployee._id, {
          limit: 1,
          sortBy: 'checkDate',
          sortOrder: 'desc',
        });

        if (response.success && response.data?.checks && response.data.checks.length > 0) {
          const lastCheck = response.data.checks[0];

          // Helper function to normalize enum values for form
          const normalizeEnumValue = (value: string): string => {
            if (!value) return value;
            // Convert "PC" to "pc", "Laptop" to "laptop", etc.
            return value.toLowerCase().replace(/\s+/g, '');
          };

          // Build complete form data object - more efficient than individual setValue calls
          const formDataToSet = {
            employeeId: selectedEmployee._id,
            deviceDetail: {
              deviceType: normalizeEnumValue(lastCheck.deviceDetail?.deviceType || 'laptop'),
              ownership: normalizeEnumValue(lastCheck.deviceDetail?.ownership || 'company'),
              deviceBrand: lastCheck.deviceDetail?.deviceBrand || '',
              deviceModel: lastCheck.deviceDetail?.deviceModel || '',
              serialNumber: lastCheck.deviceDetail?.serialNumber || '',
            },
            operatingSystem: {
              osType: normalizeEnumValue(lastCheck.operatingSystem?.osType || 'windows'),
              osVersion: lastCheck.operatingSystem?.osVersion || '',
              osLicense: normalizeEnumValue(lastCheck.operatingSystem?.osLicense || 'original'),
              osRegularUpdate: lastCheck.operatingSystem?.osRegularUpdate ?? true,
            },
            specification: {
              ramCapacity: lastCheck.specification?.ramCapacity || '',
              processor: lastCheck.specification?.processor || '',
              storage: (lastCheck.specification?.storage || []).map((item: any) => ({
                type: normalizeEnumValue(item.type || 'hdd'),
                size: item.size || '',
              })),
            },
            deviceCondition: {
              deviceSuitability: normalizeEnumValue(lastCheck.deviceCondition?.deviceSuitability || 'suitable'),
              batterySuitability: lastCheck.deviceCondition?.batterySuitability || '',
              keyboardCondition: lastCheck.deviceCondition?.keyboardCondition || '',
              touchpadCondition: lastCheck.deviceCondition?.touchpadCondition || '',
              monitorCondition: lastCheck.deviceCondition?.monitorCondition || '',
              wifiCondition: lastCheck.deviceCondition?.wifiCondition || '',
            },
            workApplications: (lastCheck.workApplications || []).map((app: any) => ({
              applicationName: app.applicationName || '',
              license: normalizeEnumValue(app.license || 'original'),
              notes: app.notes || '',
            })),
            nonWorkApplications: (lastCheck.nonWorkApplications || []).map((app: any) => ({
              applicationName: app.applicationName || '',
              license: normalizeEnumValue(app.license || 'original'),
              notes: app.notes || '',
            })),
            security: {
              antivirus: {
                status: normalizeEnumValue(lastCheck.security?.antivirus?.status || 'active'),
                list: (lastCheck.security?.antivirus?.list || []).map((app: any) => ({
                  applicationName: app.applicationName || '',
                  license: normalizeEnumValue(app.license || 'original'),
                  notes: app.notes || '',
                })),
              },
              vpn: {
                status: normalizeEnumValue(lastCheck.security?.vpn?.status || 'available'),
                list: (lastCheck.security?.vpn?.list || []).map((vpn: any) => ({
                  vpnName: vpn.vpnName || '',
                  license: normalizeEnumValue(vpn.license || 'original'),
                  notes: vpn.notes || '',
                })),
              },
            },
            additionalInfo: {
              passwordUsage: normalizeEnumValue(lastCheck.additionalInfo?.passwordUsage || 'available'),
              inspectorPICName: lastCheck.additionalInfo?.inspectorPICName || '',
              otherNotes: lastCheck.additionalInfo?.otherNotes || '',
            },
          };

          // Reset form with complete data object - atomic operation prevents race conditions
          reset(formDataToSet);

          toast.success(t('form.employeeInfo.lastVersionLoaded'));
        } else {
          toast.info(t('form.employeeInfo.noPreviousRecord'));
          setUseLastVersion(false);
        }
      } catch (error) {
        console.error('Error fetching last version data:', error);
        toast.error(t('errors.generic'));
        setUseLastVersion(false);
      } finally {
        setLoadingLastVersion(false);
      }
    };

    fetchLastVersionData();
  }, [useLastVersion, selectedEmployee?._id, reset, t]);

  const onSubmit = async (data: any) => {
    if (!data.employeeId) {
      toast.error(t('form.toast.selectEmployee'));
      return;
    }

    setLoading(true);
    try {
      // Normalize data to match database enum values
      const normalizedData = normalizeDataForSubmission(data);
      const response = await createDeviceCheck(normalizedData);
      if (response.success && response.data) {
        toast.success(t('form.toast.createSuccess'));
        router.push('/data-pengecekan');
      } else {
        toast.error(t('form.toast.createFailed'));
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || t('form.toast.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {loadingLastVersion && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-8 shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{t('form.employeeInfo.loadingLastVersion')}</p>
            <p className="text-sm text-muted-foreground">
              {t('form.employeeInfo.pleaseWait')}
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('form.title')}</h1>
        <p className="text-muted-foreground">
          {t('form.description')}
        </p>
      </div>

      {/* Form with Sidebar Navigation */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block sticky top-24 h-fit space-y-1">
          <p className="text-sm font-medium text-muted-foreground mb-3">{t('form.formSections')}</p>
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
                {t('form.employeeInfo.title')}
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

              {/* Use Last Version Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useLastVersion"
                  checked={useLastVersion}
                  onChange={(e) => setUseLastVersion(e.target.checked)}
                  disabled={!selectedEmployee || loadingLastVersion}
                  className="h-4 w-4"
                />
                <Label htmlFor="useLastVersion" className={`cursor-pointer ${!selectedEmployee ? 'opacity-50' : ''}`}>
                  {loadingLastVersion ? t('form.employeeInfo.loadingLastVersion') : t('form.employeeInfo.useLastVersion')}
                </Label>
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
                  onDelete={handleDeleteOption('deviceBrand')}
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
                  <Label htmlFor="ramCapacity">{t('form.specification.ramCapacity')}&nbsp;(GB)</Label>
                  <CreatableSelect
                    key="ramCapacity"
                    inputType="number"
                    options={dropdownOptions['ramCapacity'] || []}
                    value={watch('specification.ramCapacity')}
                    onChange={(val) => setValue('specification.ramCapacity', val)}
                    onCreate={(val) => handleCreateOption('ramCapacity', val)}
                    onDelete={handleDeleteOption('ramCapacity')}
                    placeholder={t('form.placeholders.ramCapacity')}
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
                    onDelete={handleDeleteOption('processor')}
                    placeholder={t('form.placeholders.processor')}
                  />
                </div>
              </div>

              {/* Storage Section with Add/Delete */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>{t('form.specification.storage')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendStorage({ type: 'hdd', size: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('common.tooltips.addStorage')}</TooltipContent>
                  </Tooltip>
                </div>
                {storageFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
                    <select
                      {...register(`specification.storage.${index}.type` as any)}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="hdd">{t('form.specification.memoryTypeOptions.hdd')}</option>
                      <option value="ssd">{t('form.specification.memoryTypeOptions.ssd')}</option>
                    </select>
                    <CreatableSelect
                      key={`storage-${field.id}`}
                      inputType="number"
                      options={dropdownOptions['memoryCapacity'] || []}
                      value={watch(`specification.storage.${index}.size` as any)}
                      onChange={(val) => setValue(`specification.storage.${index}.size` as any, val)}
                      onCreate={(val) => handleCreateOption('memoryCapacity', val)}
                      onDelete={handleDeleteOption('memoryCapacity')}
                      placeholder={`${t('form.specification.storageCapacity')} (GB)`}
                    />
                    {storageFields.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStorage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ))}
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
                  <Label htmlFor="batterySuitability">{t('form.deviceCondition.battery')}</Label>
                  <Input
                    id="batterySuitability"
                    {...register('deviceCondition.batterySuitability')}
                    placeholder={t('form.placeholders.battery')}
                  />
                </div>
                <div>
                  <Label htmlFor="keyboardCondition">{t('form.deviceCondition.keyboard')}</Label>
                  <Input
                    id="keyboardCondition"
                    {...register('deviceCondition.keyboardCondition')}
                    placeholder={t('form.placeholders.keyboard')}
                  />
                </div>
                <div>
                  <Label htmlFor="touchpadCondition">{t('form.deviceCondition.touchpad')}</Label>
                  <Input
                    id="touchpadCondition"
                    {...register('deviceCondition.touchpadCondition')}
                    placeholder={t('form.placeholders.touchpad')}
                  />
                </div>
                <div>
                  <Label htmlFor="monitorCondition">{t('form.deviceCondition.monitor')}</Label>
                  <Input
                    id="monitorCondition"
                    {...register('deviceCondition.monitorCondition')}
                    placeholder={t('form.placeholders.monitor')}
                  />
                </div>
                <div>
                  <Label htmlFor="wifiCondition">{t('form.deviceCondition.wifi')}</Label>
                  <Input
                    id="wifiCondition"
                    {...register('deviceCondition.wifiCondition')}
                    placeholder={t('form.placeholders.wifi')}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendWorkApp({ applicationName: '', license: 'original', notes: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('common.tooltips.addWorkApp')}</TooltipContent>
                  </Tooltip>
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
                    {workAppFields.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWorkApp(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>

              {/* Non-Work Applications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>{t('form.applications.nonWorkApplications')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendNonWorkApp({ applicationName: '', license: 'original', notes: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('common.tooltips.addNonWorkApp')}</TooltipContent>
                  </Tooltip>
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
                    {nonWorkAppFields.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNonWorkApp(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendAntivirus({ applicationName: '', license: 'original', notes: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('common.tooltips.addAntivirus')}</TooltipContent>
                  </Tooltip>
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
                    {antivirusFields.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAntivirus(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendVpn({ vpnName: '', license: 'original', notes: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('common.tooltips.addVPN')}</TooltipContent>
                  </Tooltip>
                </div>
                {vpnFields.map((field, index) => (
                  <div key={field.id} className="grid md:grid-cols-[1fr_1fr_2fr_auto] gap-2 mb-2 items-start">
                    <Input
                      placeholder={t('form.placeholders.applicationName')}
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
                    {vpnFields.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVpn(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
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
                  onDelete={handleDeleteOption('inspectorPICName')}
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
                  {t('form.additionalInfo.pressEnter')}
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
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? t('common.loading') : t('form.title')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading form...</div>}>
      <FormContent />
    </Suspense>
  );
}