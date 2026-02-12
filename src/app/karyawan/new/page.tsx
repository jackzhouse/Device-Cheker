'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/lib/services/employees.service';
import { getDropdownOptions, saveDropdownOption } from '@/lib/services/dropdown-options.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatableSelect, type SelectOption } from '@/components/ui/select';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateEmployeePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = React.useState(false);
    const [dropdownOptions, setDropdownOptions] = React.useState<Record<string, SelectOption[]>>({});

    const [formData, setFormData] = React.useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        email: '',
        phoneNumber: '',
        status: 'Active' as 'Active' | 'Inactive' | 'Resigned',
    });

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

    // Handle creating new dropdown option
    const handleCreateOption = async (fieldName: string, value: string) => {
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
            saveDropdownOption(fieldName, normalizedValue)
                .then(() => {
                    // Refresh from server after successful save to get updated usage counts
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
                    toast.error('Failed to save option to database');
                });
        } catch (error) {
            console.error('Error creating option:', error);
            toast.error('Failed to create option');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.position) {
            toast.error(t('createEmployee.validation.requiredFields'));
            return;
        }

        setLoading(true);
        try {
            const response = await createEmployee({
                employeeId: formData.employeeId.trim().toUpperCase() || undefined,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                position: formData.position.trim().toUpperCase(),
                department: formData.department ? formData.department.trim().toUpperCase() : undefined,
                email: formData.email || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                status: formData.status,
            });

            if (response.success && response.data) {
                toast.success(t('createEmployee.validation.createSuccess'));
                router.push('/karyawan');
            } else {
                toast.error(t('createEmployee.validation.createFailed'));
            }
        } catch (error: any) {
            console.error('Error creating employee:', error);
            toast.error(error.message || t('createEmployee.validation.createFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 m-3">

            {/* Page Header */}
            <div className="mb-6">
                <div className='flex justify-between'>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UserPlus className="h-8 w-8" />
                        {t('createEmployee.title')}
                    </h1>
                    {/* Back Button */}
                    <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('createEmployee.backToEmployees')}
                    </Button>
                </div>
                <p className="text-muted-foreground mt-2">
                    {t('createEmployee.description')}
                </p>
            </div>

            {/* Form Card */}
            <Card className=" mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{t('createEmployee.formTitle')}</CardTitle>
                        <CardDescription>
                            {t('createEmployee.formDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {/* Employee ID */}
                            <div className="space-y-2">
                                <Label htmlFor="employeeId">{t('employee.employeeId')}</Label>
                                <Input
                                    id="employeeId"
                                    value={formData.employeeId}
                                    onChange={(e) => handleInputChange('employeeId', e.target.value.toUpperCase())}
                                    placeholder="Enter employee ID"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank for auto-generation.
                                </p>
                            </div>

                            {/* Personal Information */}
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
                                    <Label htmlFor="lastName">{t('createEmployee.lastName')}</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        placeholder={t('createEmployee.placeholders.lastName')}
                                    />
                                </div>
                            </div>

                            {/* Work Information */}
                            <div className="space-y-2">
                                <Label htmlFor="position">{t('createEmployee.position')} {t('createEmployee.required')}</Label>
                                <CreatableSelect
                                    key="position"
                                    options={dropdownOptions['position'] || []}
                                    value={formData.position}
                                    onChange={(val) => handleInputChange('position', val)}
                                    onCreate={(val) => handleCreateOption('position', val)}
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
                                    onCreate={(val) => handleCreateOption('department', val)}
                                    placeholder={t('createEmployee.placeholders.department')}
                                />
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('createEmployee.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder={t('createEmployee.placeholders.email')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">{t('createEmployee.phoneNumber')}</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    placeholder={t('createEmployee.placeholders.phoneNumber')}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">{t('createEmployee.status')}</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="Active">{t('createEmployee.statusOptions.active')}</option>
                                    <option value="Inactive">{t('createEmployee.statusOptions.inactive')}</option>
                                    <option value="Resigned">{t('createEmployee.statusOptions.resigned')}</option>
                                </select>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {t('createEmployee.cancel')}
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? t('createEmployee.creating') : t('createEmployee.createButton')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}