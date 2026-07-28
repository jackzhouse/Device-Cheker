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
import { useFieldArray, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Save, User, Laptop, HardDrive, Shield, Calendar, Loader2, HelpCircle, Keyboard, X, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
import { getEmployeeById } from '@/lib/services/employees.service';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMobileDeviceMacError, normalizeMacAddress } from '@/lib/utils/mobile-devices';
import FormSectionNav from '@/components/form/FormSectionNav';

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

type MobileDeviceItem = {
  deviceName?: string;
  macAddress?: string;
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
  mobileDevices: MobileDeviceItem[];
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
  const [lastVersionPreviewOpen, setLastVersionPreviewOpen] = React.useState(false);
  const [pendingLastVersionData, setPendingLastVersionData] = React.useState<Partial<FormData> | null>(null);
  const [helpModalOpen, setHelpModalOpen] = React.useState(false);
  const [shortcutPanelOpen, setShortcutPanelOpen] = React.useState(false);
  const [draftSavedAt, setDraftSavedAt] = React.useState<number | null>(null);
  const [activeSection, setActiveSection] = React.useState('employee');
  const formRef = React.useRef<HTMLFormElement>(null);
  const draftRestoredRef = React.useRef(false);

  const { register, control, watch, handleSubmit, setValue, reset, formState: { errors, isDirty } } = useForm<FormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
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
      mobileDevices: [],
      additionalInfo: {
        passwordUsage: 'available',
        otherNotes: '',
        inspectorPICName: '',
      },
    },
  });
  const watchedValues = useWatch({ control });
  const draftStorageKey = 'device-check-form-draft';

  React.useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(draftStorageKey);
      if (!rawDraft) {
        draftRestoredRef.current = true;
        return;
      }
      const draft = JSON.parse(rawDraft) as Partial<FormData>;
      reset(draft as FormData);
      setDraftSavedAt(Date.now());
      if (draft.employeeId) {
        getEmployeeById(draft.employeeId).then((response) => {
          if (response.success && response.data) setSelectedEmployee(response.data);
        }).catch(() => undefined);
      }
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    } finally {
      draftRestoredRef.current = true;
    }
  }, [reset]);

  React.useEffect(() => {
    if (!draftRestoredRef.current || !isDirty) return;
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(watchedValues));
      setDraftSavedAt(Date.now());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [watchedValues, isDirty]);

  React.useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [isDirty]);

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

  const {
    fields: mobileDeviceFields,
    append: appendMobileDevice,
    remove: removeMobileDevice,
  } = useFieldArray({ control, name: 'mobileDevices' });

  // Handle URL params for pre-filling employee
  React.useEffect(() => {
    const employeeIdFromUrl = searchParams.get('employeeId');
    if (employeeIdFromUrl) {
      setValue('employeeId', employeeIdFromUrl);
      handleEmployeeSelect(employeeIdFromUrl);
    }
  }, [searchParams, setValue]);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save form
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }

      // Ctrl/Cmd + /: Toggle help modal
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setHelpModalOpen((prev) => !prev);
      }

      // Esc: Close help modal
      if (e.key === 'Escape' && helpModalOpen) {
        setHelpModalOpen(false);
      }

      // Alt + 1-9: Jump to sections
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const sectionNum = parseInt(e.key);
        const sectionId = sections[sectionNum - 1]?.id;
        if (sectionId) {
          const section = document.getElementById(sectionId);
          if (section) {
            const headerOffset = 80; // Account for sticky header
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [helpModalOpen]);

  // Track active section for progress indicator
  React.useEffect(() => {
    const handleScroll = () => {
      const sectionsList = ['employee', 'device', 'os', 'spec', 'condition', 'apps', 'security', 'mobile-devices', 'info'];
      const scrollPosition = window.scrollY + 120; // Offset for better detection
      
      // Use last section already reached, keeping anchor state aligned with reading position.
      let activeId = sectionsList[0];
      for (let i = 0; i < sectionsList.length; i++) {
        const section = document.getElementById(sectionsList[i]);
        if (section && section.offsetTop <= scrollPosition) {
          activeId = sectionsList[i];
        }
      }
      
      setActiveSection(activeId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'employee', title: t('form.sections.employee'), icon: User, label: '1' },
    { id: 'device', title: t('form.sections.deviceDetail'), icon: Laptop, label: '2' },
    { id: 'os', title: t('form.sections.operatingSystem'), icon: HardDrive, label: '3' },
    { id: 'spec', title: t('form.sections.specification'), icon: HardDrive, label: '4' },
    { id: 'condition', title: t('form.sections.deviceCondition'), icon: Shield, label: '5' },
    { id: 'apps', title: t('form.sections.applications'), icon: Shield, label: '6' },
    { id: 'security', title: t('form.sections.security'), icon: Shield, label: '7' },
    { id: 'mobile-devices', title: t('form.sections.mobileDevices'), icon: Smartphone, label: '8' },
    { id: 'info', title: t('form.sections.additionalInfo'), icon: Calendar, label: '9' },
  ] as const;

  // Determine completed sections
  const getSectionStatus = (sectionId: string): 'complete' | 'incomplete' | 'skipped' => {
    const formData = watch();
    switch (sectionId) {
      case 'employee':
        return formData.employeeId && formData.checkDate ? 'complete' : 'incomplete';
      case 'device':
        return formData.deviceDetail?.deviceBrand && formData.deviceDetail?.deviceModel && formData.deviceDetail?.serialNumber ? 'complete' : 'incomplete';
      case 'os':
        return formData.operatingSystem?.osVersion && formData.operatingSystem?.osLicense ? 'complete' : 'incomplete';
      case 'spec':
        return formData.specification?.ramCapacity && formData.specification?.processor ? 'complete' : 'incomplete';
      case 'condition':
        return formData.deviceCondition?.deviceSuitability ? 'complete' : 'incomplete';
      case 'apps':
        return 'complete';
      case 'security':
        return 'complete';
      case 'mobile-devices':
        return formData.mobileDevices?.length ? 'complete' : 'skipped';
      case 'info':
        return formData.additionalInfo?.passwordUsage ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

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
    setUseLastVersion(false);
    setPendingLastVersionData(null);
    setLastVersionPreviewOpen(false);

    // Reset form to default values for new employee
    reset({
      employeeId: employeeId,
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
      mobileDevices: [],
      additionalInfo: {
        passwordUsage: 'available',
        otherNotes: '',
        inspectorPICName: '',
      },
    });

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
            mobileDevices: (lastCheck.mobileDevices || []).map((device: any) => ({
              deviceName: device.deviceName || '',
              macAddress: device.macAddress || '',
            })),
            additionalInfo: {
              passwordUsage: normalizeEnumValue(lastCheck.additionalInfo?.passwordUsage || 'available'),
              inspectorPICName: lastCheck.additionalInfo?.inspectorPICName || '',
              otherNotes: lastCheck.additionalInfo?.otherNotes || '',
            },
          };

          setPendingLastVersionData(formDataToSet as Partial<FormData>);
          setLastVersionPreviewOpen(true);
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

  const cancelLastVersionPreview = () => {
    setLastVersionPreviewOpen(false);
    setPendingLastVersionData(null);
    setUseLastVersion(false);
  };

  const applyLastVersionPreview = () => {
    if (!pendingLastVersionData) return;
    reset(pendingLastVersionData);
    setLastVersionPreviewOpen(false);
    setPendingLastVersionData(null);
    toast.success(t('form.employeeInfo.lastVersionLoaded'));
  };

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
        window.sessionStorage.removeItem(draftStorageKey);
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

  const completedSections = sections.filter((section) => section.id !== 'mobile-devices' && getSectionStatus(section.id) === 'complete').length;
  const saveDraft = () => {
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(watchedValues));
    setDraftSavedAt(Date.now());
    toast.success(t('common.save'));
  };

  return (
    <div className="page-shell relative">
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
      <div className="page-hero">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Input Check</div>
          <h1 className="page-title">{t('form.title')}</h1>
          <p className="page-desc mt-2">
            {t('form.description')}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setHelpModalOpen(true)}
              className="h-8 w-8"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('form.help.tooltip')}</TooltipContent>
        </Tooltip>
      </div>

      <FormSectionNav sections={sections} activeSection={activeSection} getSectionStatus={getSectionStatus} ariaLabel={t('form.formSections')} />
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-subtle)] px-3 py-2 text-xs text-muted-foreground">
        <span>{completedSections}/8 {t('form.progress.sectionsComplete')}</span>
        <span>{draftSavedAt ? `${t('form.progress.draftSaved')} ${new Date(draftSavedAt).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : t('form.progress.noDraft')}</span>
      </div>

      <Dialog open={lastVersionPreviewOpen} onOpenChange={(open) => { if (!open) cancelLastVersionPreview(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Pratinjau versi terakhir' : 'Preview last version'}</DialogTitle>
            <DialogDescription>
              {language === 'id' ? 'Data berikut akan mengisi form setelah Anda memilih Terapkan. Input saat ini belum berubah.' : 'The following data will fill the form after you choose Apply. Current input is unchanged.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-subtle)] p-3 text-sm">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t('form.deviceDetail.deviceBrand')} / {t('form.deviceDetail.deviceModel')}</span><strong>{pendingLastVersionData?.deviceDetail?.deviceBrand || '-'} / {pendingLastVersionData?.deviceDetail?.deviceModel || '-'}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t('form.deviceDetail.serialNumber')}</span><strong>{pendingLastVersionData?.deviceDetail?.serialNumber || '-'}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t('form.operatingSystem.osType')} / {t('form.operatingSystem.osVersion')}</span><strong>{pendingLastVersionData?.operatingSystem?.osType || '-'} / {pendingLastVersionData?.operatingSystem?.osVersion || '-'}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">{t('form.specification.processor')}</span><strong>{pendingLastVersionData?.specification?.processor || '-'}</strong></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">{language === 'id' ? 'Aplikasi' : 'Applications'}</span><strong>{(pendingLastVersionData?.workApplications?.length || 0) + (pendingLastVersionData?.nonWorkApplications?.length || 0)}</strong></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelLastVersionPreview}>{t('common.cancel')}</Button>
            <Button type="button" onClick={applyLastVersionPreview}>{language === 'id' ? 'Terapkan' : 'Apply'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t('form.help.title')}
            </DialogTitle>
            <DialogDescription>
              {t('form.help.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            {/* Form Introduction */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t('form.help.about.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('form.help.about.description1')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('form.help.about.description2')}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t('form.help.howToFill.title')}</h3>
              <div className="space-y-2 text-sm">
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step1.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step1.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step2.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step2.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step3.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step3.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step4.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step4.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step5.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step5.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step6.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step6.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step7.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step7.description')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-3">
                  <h4 className="font-medium">{t('form.help.howToFill.step8.title')}</h4>
                  <p className="text-muted-foreground mt-1">
                    {t('form.help.howToFill.step8.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t('form.help.proTips.title')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>{t('form.help.proTips.tip1')}</li>
                <li>{t('form.help.proTips.tip2')}</li>
                <li>{t('form.help.proTips.tip3')}</li>
                <li>{t('form.help.proTips.tip4')}</li>
              </ul>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t('form.help.keyboardShortcuts.title')}</h3>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.saveForm')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Ctrl/Cmd + S</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.toggleHelp')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Ctrl/Cmd + /</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.nextField')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Tab</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.prevField')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Shift + Tab</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.submitForm')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.closeModal')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Esc</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.newLine')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Shift + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.jumpToSection')}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">Alt + 1-9</kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="form-workflow">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          {/* Employee Section */}
          <Card id="employee" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('form.employeeInfo.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-3">
              <EmployeeAutocomplete
                value={watch('employeeId')}
                onChange={handleEmployeeSelect}
                error={errors.employeeId?.message as string}
              />

              {selectedEmployee && (
                <div className="form-identity-strip">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                    <div>
                      <Label className="data-label">{t('form.employeeInfo.fullName')}</Label>
                      <p className="truncate text-sm font-semibold">{selectedEmployee.fullName}</p>
                    </div>
                    <div>
                      <Label className="data-label">{t('form.employeeInfo.position')}</Label>
                      <p className="truncate text-sm font-semibold">{selectedEmployee.position}</p>
                    </div>
                    {selectedEmployee.department && (
                      <div>
                        <Label className="data-label">{t('form.employeeInfo.department')}</Label>
                        <p className="truncate text-sm font-semibold">{selectedEmployee.department}</p>
                      </div>
                    )}
                    <div>
                      <Label className="data-label">{t('form.employeeInfo.totalChecks')}</Label>
                      <p className="text-sm font-semibold">{selectedEmployee.totalDeviceChecks}</p>
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
                  aria-invalid={Boolean(errors.checkDate)}
                  aria-describedby={errors.checkDate ? 'checkDate-error' : undefined}
                />
                {errors.checkDate?.message && (
                  <p id="checkDate-error" role="alert" className="text-sm text-destructive mt-1">{errors.checkDate.message as string}</p>
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
          <Card id="device" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                {t('form.deviceDetail.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="deviceModel">{t('form.deviceDetail.deviceModel')} *</Label>
                  <Input
                    id="deviceModel"
                    {...register('deviceDetail.deviceModel', { required: t('form.validation.deviceModelRequired') })}
                    aria-invalid={Boolean(errors.deviceDetail?.deviceModel)}
                    aria-describedby={errors.deviceDetail?.deviceModel ? 'deviceModel-error' : undefined}
                  />
                  {errors.deviceDetail?.deviceModel?.message && <p id="deviceModel-error" role="alert" className="mt-1 text-sm text-destructive">{errors.deviceDetail.deviceModel.message as string}</p>}
                </div>
                <div>
                  <Label htmlFor="serialNumber">{t('form.deviceDetail.serialNumber')} *</Label>
                  <Input
                    id="serialNumber"
                    {...register('deviceDetail.serialNumber', { required: t('form.validation.serialNumberRequired') })}
                    aria-invalid={Boolean(errors.deviceDetail?.serialNumber)}
                    aria-describedby={errors.deviceDetail?.serialNumber ? 'serialNumber-error' : undefined}
                  />
                  {errors.deviceDetail?.serialNumber?.message && <p id="serialNumber-error" role="alert" className="mt-1 text-sm text-destructive">{errors.deviceDetail.serialNumber.message as string}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating System Section */}
          <Card id="os" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                {t('form.operatingSystem.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    aria-invalid={Boolean(errors.operatingSystem?.osVersion)}
                    aria-describedby={errors.operatingSystem?.osVersion ? 'osVersion-error' : undefined}
                    placeholder={t('form.placeholders.osVersion')}
                  />
                  {errors.operatingSystem?.osVersion?.message && <p id="osVersion-error" role="alert" className="mt-1 text-sm text-destructive">{errors.operatingSystem.osVersion.message as string}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="osLicense">{t('form.operatingSystem.osLicense')} *</Label>
                  <select
                    id="osLicense"
                    {...register('operatingSystem.osLicense', { required: t('form.validation.osLicenseRequired') })}
                    aria-invalid={Boolean(errors.operatingSystem?.osLicense)}
                    aria-describedby={errors.operatingSystem?.osLicense ? 'osLicense-error' : undefined}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="original">{t('form.operatingSystem.osLicenseOptions.original')}</option>
                    <option value="pirated">{t('form.operatingSystem.osLicenseOptions.pirated')}</option>
                    <option value="openSource">{t('form.operatingSystem.osLicenseOptions.openSource')}</option>
                    <option value="unknown">{t('form.operatingSystem.osLicenseOptions.unknown')}</option>
                  </select>
                  {errors.operatingSystem?.osLicense?.message && <p id="osLicense-error" role="alert" className="mt-1 text-sm text-destructive">{errors.operatingSystem.osLicense.message as string}</p>}
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
          <Card id="spec" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                {t('form.specification.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
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
                  <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto] md:mb-2 md:items-start">
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
          <Card id="condition" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('form.deviceCondition.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
          <Card id="apps" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('form.applications.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-5">
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
                  <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_2fr_auto] md:mb-2 md:items-start">
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
                  <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_2fr_auto] md:mb-2 md:items-start">
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
          <Card id="security" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('form.security.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-5">
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
                  <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_2fr_auto] md:mb-2 md:items-start">
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
                  <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_2fr_auto] md:mb-2 md:items-start">
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

          {/* Mobile Device Section */}
          <Card id="mobile-devices" className="form-section">
            <CardHeader className="form-section-heading">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {t('form.mobileDevices.title')}
                </CardTitle>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {mobileDeviceFields.length ? t('form.mobileDevices.filled') : t('form.mobileDevices.skipped')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
              <div className="flex items-center justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendMobileDevice({ deviceName: '', macAddress: '' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('common.add')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('common.tooltips.addItem')}</TooltipContent>
                </Tooltip>
              </div>
              {mobileDeviceFields.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  {t('form.mobileDevices.empty')}
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-3 px-3 text-[11px] font-semibold uppercase tracking-[.06em] text-muted-foreground sm:grid">
                    <span>{t('form.mobileDevices.deviceName')}</span>
                    <span>{t('form.mobileDevices.macAddress')}</span>
                    <span>{t('form.mobileDevices.actions')}</span>
                  </div>
                  {mobileDeviceFields.map((field, index) => (
                    <div key={field.id} className="mobile-device-row grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] sm:items-start sm:p-3">
                      <div className="space-y-1.5">
                        <Label className="sm:hidden" htmlFor={`mobileDeviceName-${field.id}`}>{t('form.mobileDevices.deviceName')}</Label>
                        <Input className="mobile-device-input" id={`mobileDeviceName-${field.id}`} {...register(`mobileDevices.${index}.deviceName`)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="sm:hidden" htmlFor={`mobileDeviceMac-${field.id}`}>{t('form.mobileDevices.macAddress')}</Label>
                          <Input
                            className="mobile-device-input"
                          id={`mobileDeviceMac-${field.id}`}
                          {...register(`mobileDevices.${index}.macAddress`, {
                            validate: (value) => {
                              const error = getMobileDeviceMacError(value, index, watch('mobileDevices'));
                              return error === 'invalid'
                                ? t('form.mobileDevices.invalidMac')
                                : error === 'duplicate' ? t('form.mobileDevices.duplicateMac') : true;
                            },
                          })}
                          onChange={(event) => setValue(`mobileDevices.${index}.macAddress`, normalizeMacAddress(event.target.value), { shouldDirty: true, shouldValidate: true })}
                        />
                        <p className="text-[11px] text-muted-foreground">{t('form.mobileDevices.macFormat')}</p>
                        {errors.mobileDevices?.[index]?.macAddress?.message && (
                          <p className="mt-1 text-xs text-destructive">{errors.mobileDevices[index]?.macAddress?.message as string}</p>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 self-start" onClick={() => removeMobileDevice(index)} aria-label={t('common.tooltips.removeItem')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('common.tooltips.removeItem')}</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Section */}
          <Card id="info" className="form-section">
            <CardHeader className="form-section-heading">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('form.additionalInfo.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="form-section-content space-y-4">
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
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="outline" onClick={saveDraft} disabled={loading}>{t('form.progress.saveDraft')}</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" disabled={loading} className="flex-1 w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t('common.loading') : t('form.title')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('form.help.submitButton.tooltip')}</TooltipContent>
            </Tooltip>
          </div>
        </form>
      </div>

      {/* Floating Keyboard Shortcuts Panel */}
      {shortcutPanelOpen && (
        <div className="fixed bottom-3 right-3 z-40 w-[calc(100vw-1.5rem)] max-w-xs">
          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{t('form.help.floatingPanel.title')}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShortcutPanelOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.saveForm')}</span>
                <kbd className="px-1.5 py-0.5 font-mono bg-muted border rounded">Ctrl/Cmd+S</kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.nextField')}</span>
                <kbd className="px-1.5 py-0.5 font-mono bg-muted border rounded">Tab</kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('form.help.keyboardShortcuts.jumpToSection')}</span>
                <kbd className="px-1.5 py-0.5 font-mono bg-muted border rounded">Alt+1-9</kbd>
              </div>
              <div className="pt-2 border-t mt-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setHelpModalOpen(true)}
                  className="h-auto p-0 text-xs"
                >
                  {t('form.help.floatingPanel.showAll')} →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Icon to Reopen Panel */}
      {!shortcutPanelOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShortcutPanelOpen(true)}
              className="fixed bottom-4 right-4 z-40"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('form.help.floatingPanel.title')}</TooltipContent>
        </Tooltip>
      )}
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
