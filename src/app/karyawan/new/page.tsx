'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/lib/services/employees.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateEmployeePage() {
  const router = useRouter();
  const { t } = useLanguage();
    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        email: '',
        phoneNumber: '',
        status: 'Active' as 'Active' | 'Inactive' | 'Resigned',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.position) {
            toast.error(t('createEmployee.validation.requiredFields'));
            return;
        }

        setLoading(true);
        try {
            const response = await createEmployee({
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

                            {/* Work Information */}
                            <div className="space-y-2">
                                <Label htmlFor="position">{t('createEmployee.position')} {t('createEmployee.required')}</Label>
                                <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    placeholder={t('createEmployee.placeholders.position')}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">{t('createEmployee.department')}</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
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