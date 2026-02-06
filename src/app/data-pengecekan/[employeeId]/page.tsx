'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEmployeeChecks, type DeviceCheck } from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, HardDrive, Laptop, User, Building, Edit, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { generateDeviceCheckPDF, generateEmployeeHistoryPDF } from '@/lib/utils/pdf';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmployeeCheckHistoryData {
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    position: string;
    department?: string;
    email?: string;
    status: string;
  };
  checks: Array<{
    _id: string;
    version: number;
    checkDate: string;
    deviceDetail: {
      deviceType: 'PC' | 'Laptop';
      deviceBrand: string;
      deviceModel: string;
      serialNumber: string;
      ownership: 'Company' | 'Personal';
    };
    deviceCondition: {
      deviceSuitability: string;
    };
  }>;
  summary: {
    totalChecks: number;
    latestCheckDate: string | null;
    deviceTypes: {
      PC: number;
      Laptop: number;
    };
    ownership: {
      Company: number;
      Personal: number;
    };
  };
}

export default function EmployeeHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;
  const { t } = useLanguage();
  const [data, setData] = React.useState<EmployeeCheckHistoryData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Helper to get translated device type
  const getDeviceTypeLabel = (value: string) => {
    const keyMap: Record<string, string> = {
      'pc': 'pc',
      'laptop': 'laptop',
      'PC': 'pc',
      'Laptop': 'laptop',
    };
    const key = keyMap[value] || value;
    return t(`form.deviceDetail.deviceTypeOptions.${key}` as any);
  };

  // Helper to get translated ownership
  const getOwnershipLabel = (value: string) => {
    const keyMap: Record<string, string> = {
      'company': 'company',
      'personal': 'personal',
      'Company': 'company',
      'Personal': 'personal',
    };
    const key = keyMap[value] || value;
    return t(`form.deviceDetail.ownershipOptions.${key}` as any);
  };

  // Helper to get badge variant
  const getSuitabilityBadgeVariant = (value: string) => {
    const variants: Record<string, string> = {
      'suitable': 'success',
      'limitedSuitability': 'warning',
      'needsRepair': 'destructive',
      'unsuitable': 'destructive',
      'Suitable': 'success',
      'Limited Suitability': 'warning',
      'Needs Repair': 'destructive',
      'Unsuitable': 'destructive',
    };
    return variants[value] || 'default';
  };

  // Helper to get translated suitability
  const getSuitabilityLabel = (value: string) => {
    const keyMap: Record<string, string> = {
      'suitable': 'suitable',
      'limitedSuitability': 'limitedSuitability',
      'needsRepair': 'needsRepair',
      'unsuitable': 'unsuitable',
      'Suitable': 'suitable',
      'Limited Suitability': 'limitedSuitability',
      'Needs Repair': 'needsRepair',
      'Unsuitable': 'unsuitable',
    };
    const key = keyMap[value] || value;
    return t(`checkData.suitability.${key}` as any);
  };

  const getSuitabilityBadge = (suitability: string) => {
    const variant = getSuitabilityBadgeVariant(suitability);
    const label = getSuitabilityLabel(suitability);
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  React.useEffect(() => {
    fetchEmployeeHistory();
  }, [employeeId]);

  const fetchEmployeeHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure employeeId is a string
      const idStr = String(employeeId);
      const response = await getEmployeeChecks(idStr);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Failed to fetch employee history');
      }
    } catch (err: any) {
      console.error('Error fetching employee history:', err);
      setError(err.message || 'Failed to fetch employee history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheck = async (checkId: string) => {
    if (!confirm('Are you sure you want to delete this device check?')) {
      return;
    }

    try {
      const { deleteDeviceCheck } = await import('@/lib/services/device-checks.service');
      await deleteDeviceCheck(checkId);
      toast.success('Device check deleted successfully');
      fetchEmployeeHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete device check');
    }
  };

  const handleDownloadPDF = async (check: any) => {
    try {
      toast.loading('Generating PDF...');
      await generateDeviceCheckPDF(check as DeviceCheck);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    }
  };

  const handleExportAllPDF = async () => {
    if (!data) return;
    
    try {
      toast.loading('Generating PDF for all checks...');
      await generateEmployeeHistoryPDF(data.employee, data.checks as DeviceCheck[]);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading employee history...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{error || 'Employee not found'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { employee, checks, summary } = data;

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')}
      </Button>

      {/* Employee Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{employee.fullName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                    {employee.department && ` • ${employee.department}`}
                  </p>
                  <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'} className="mt-2">
                    {employee.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/form?employeeId=${employeeId}`)}>
                Add New Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.totalChecks}</div>
            <div className="text-sm text-muted-foreground">{t('checkData.summary.totalChecks')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.deviceTypes.PC || 0}</div>
            <div className="text-sm text-muted-foreground">{t('checkData.summary.pcDevices')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.deviceTypes.Laptop || 0}</div>
            <div className="text-sm text-muted-foreground">{t('checkData.summary.laptops')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summary.ownership.Company || 0}</div>
            <div className="text-sm text-muted-foreground">{t('checkData.summary.companyOwned')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('checkData.checkHistory')}</CardTitle>
            {checks.length > 0 && (
              <Button onClick={handleExportAllPDF}>
                <Download className="h-4 w-4 mr-2" />
                {t('checkData.exportAll')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t('checkData.noChecks')}</p>
          ) : (
            <div className="space-y-6">
              {checks.map((check, index) => (
                <div key={check._id} className="relative pl-8 pb-6 border-l-2 border-muted">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                  
                  {/* Check Card */}
                  <Card>
                    <CardContent className="pt-6">
                      {/* Employee Name Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{employee.fullName}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">v{check.version}</Badge>
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(check.checkDate)}</span>
                        </div>
                      </div>

                      {/* Device Information */}
                      <div className="mb-4">
                        <div className="font-semibold text-lg mb-1">
                          {getDeviceTypeLabel(check.deviceDetail.deviceType)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {check.deviceDetail.deviceBrand} - {check.deviceDetail.deviceModel}
                        </p>
                        <div className="mt-2">
                          <Badge 
                            variant={check.deviceDetail.ownership === 'Company' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            <Building className="h-3 w-3 mr-1" />
                            {getOwnershipLabel(check.deviceDetail.ownership)}
                          </Badge>
                        </div>
                      </div>

                      {/* Suitability and Actions */}
                      <div className="flex items-start justify-between">
                        <div>
                          {getSuitabilityBadge(check.deviceCondition.deviceSuitability)}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(check)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/form/edit/${check._id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCheck(check._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connector line (except for last item) */}
                  {index < checks.length - 1 && (
                    <div className="absolute left-0 top-24 bottom-0 -translate-x-1/2 w-px bg-muted" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}