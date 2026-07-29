'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDeviceCheckById, getEmployeeChecks, type DeviceCheck } from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, HardDrive, Laptop, User, Building, Edit, Trash2, Download, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { generateDeviceCheckPDF, generateEmployeeHistoryPDF } from '@/lib/utils/pdf';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeCheckHistoryData {
  employee: {
    _id: string;
    employeeId: string;
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
  
  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [viewCheck, setViewCheck] = React.useState<DeviceCheck | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [viewLoading, setViewLoading] = React.useState(false);

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
        setError(t('employeeHistory.fetchFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching employee history:', err);
      setError(err.message || 'Failed to fetch employee history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheckClick = (checkId: string) => {
    setDeleteTargetId(checkId);
    setDeleteModalOpen(true);
  };

  const handleViewCheck = async (checkId: string) => {
    setViewDialogOpen(true);
    setViewLoading(true);
    setViewCheck(null);
    try {
      const response = await getDeviceCheckById(checkId);
      if (!response.success || !response.data) throw new Error('Detail pengecekan tidak ditemukan');
      setViewCheck(response.data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat detail pengecekan');
      setViewDialogOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      const { deleteDeviceCheck } = await import('@/lib/services/device-checks.service');
      await deleteDeviceCheck(deleteTargetId);
      toast.success(t('employeeHistory.toast.deleteSuccess'));
      fetchEmployeeHistory();
    } catch (error: any) {
      toast.error(error.message || t('employeeHistory.toast.deleteFailed'));
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const handleDownloadPDF = async (check: any) => {
    try {
      toast.loading(t('checkData.toast.pdfGenerating'), { id: 'pdfGenerating' });
      await generateDeviceCheckPDF(check as DeviceCheck);
      toast.dismiss('pdfGenerating');
      toast.success(t('employeeHistory.toast.pdfSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('employeeHistory.toast.pdfFailed'));
    }
  };

  const handleExportAllPDF = async () => {
    if (!data) return;

    try {
      toast.loading(t('employeeHistory.toast.pdfGenerating'));
      await generateEmployeeHistoryPDF(data.employee, data.checks as DeviceCheck[]);
      toast.success(t('employeeHistory.toast.pdfSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('employeeHistory.toast.pdfFailed'));
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
        <div className="text-center">{t('employeeHistory.loading')}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{error || t('employeeHistory.notFound')}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('employeeHistory.goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { employee, checks, summary } = data;

  return (
    <div className="container py-4 sm:py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')}
      </Button>

      {/* Employee Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold">{employee.fullName}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {employee.position}
                  {employee.department && ` • ${employee.department}`}
                </p>
                <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'} className="mt-2">
                  {employee.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {employee.employeeId}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => router.push(`/form?employeeId=${employeeId}`)}>
                {t('employeeHistory.addNewCheck')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.totalChecks}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t('checkData.summary.totalChecks')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.deviceTypes.PC || 0}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t('checkData.summary.pcDevices')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.deviceTypes.Laptop || 0}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t('checkData.summary.laptops')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.ownership.Company || 0}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{t('checkData.summary.companyOwned')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="panel-card">
        <CardHeader className="pb-2">
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
            <div className="space-y-4">
              {checks.map((check, index) => (
                <div key={check._id} className="relative border-l-2 border-muted pb-4 pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-primary border-2 border-background" />

                  {/* Check Card */}
                  <Card className="panel-card">
                    <CardContent className="pt-4">
                      {/* Employee Name Section */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          <h3 className="text-base sm:text-lg font-semibold">{employee.fullName}</h3>
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
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          {getSuitabilityBadge(check.deviceCondition.deviceSuitability)}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => handleViewCheck(check._id)} aria-label={t('common.view')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(check)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/form/edit/${check._id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCheckClick(check._id)}>
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('common.view')} {t('checkData.checkHistory')}</DialogTitle>
            <DialogDescription>
              {viewCheck ? `${viewCheck.employeeSnapshot.fullName} · ${formatDate(viewCheck.checkDate)} · v${viewCheck.version}` : 'Memuat detail pengecekan...'}
            </DialogDescription>
          </DialogHeader>
          {viewLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Memuat detail...</div>
          ) : viewCheck && (
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Perangkat</CardTitle></CardHeader>
                <CardContent className="space-y-1.5 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Tipe:</span> {getDeviceTypeLabel(viewCheck.deviceDetail.deviceType)}</p>
                  <p><span className="font-medium text-foreground">Merk/model:</span> {viewCheck.deviceDetail.deviceBrand} {viewCheck.deviceDetail.deviceModel}</p>
                  <p><span className="font-medium text-foreground">Serial:</span> {viewCheck.deviceDetail.serialNumber || '-'}</p>
                  <p><span className="font-medium text-foreground">Kepemilikan:</span> {getOwnershipLabel(viewCheck.deviceDetail.ownership)}</p>
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Sistem operasi</CardTitle></CardHeader>
                <CardContent className="space-y-1.5 text-muted-foreground">
                  <p><span className="font-medium text-foreground">OS:</span> {viewCheck.operatingSystem.osType} {viewCheck.operatingSystem.osVersion}</p>
                  <p><span className="font-medium text-foreground">Lisensi:</span> {viewCheck.operatingSystem.osLicense}</p>
                  <p><span className="font-medium text-foreground">Update rutin:</span> {viewCheck.operatingSystem.osRegularUpdate ? 'Ya' : 'Tidak'}</p>
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Spesifikasi</CardTitle></CardHeader>
                <CardContent className="space-y-1.5 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Prosesor:</span> {viewCheck.specification?.processor || '-'}</p>
                  <p><span className="font-medium text-foreground">RAM:</span> {viewCheck.specification?.ramCapacity || '-'}</p>
                  <p><span className="font-medium text-foreground">Penyimpanan:</span> {viewCheck.specification?.storage?.map((storage) => `${storage.type} ${storage.size}`).join(', ') || '-'}</p>
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Kondisi perangkat</CardTitle></CardHeader>
                <CardContent className="space-y-1.5 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Kelayakan:</span> {getSuitabilityLabel(viewCheck.deviceCondition.deviceSuitability)}</p>
                  <p><span className="font-medium text-foreground">Baterai:</span> {viewCheck.deviceCondition.batterySuitability}</p>
                  <p><span className="font-medium text-foreground">Keyboard:</span> {viewCheck.deviceCondition.keyboardCondition}</p>
                  <p><span className="font-medium text-foreground">Touchpad:</span> {viewCheck.deviceCondition.touchpadCondition}</p>
                  <p><span className="font-medium text-foreground">Monitor:</span> {viewCheck.deviceCondition.monitorCondition}</p>
                  <p><span className="font-medium text-foreground">Wi-Fi:</span> {viewCheck.deviceCondition.wifiCondition}</p>
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none sm:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Aplikasi kerja</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  {viewCheck.workApplications.length ? viewCheck.workApplications.map((app, index) => (
                    <div key={`${app.applicationName}-${index}`} className="rounded-md bg-muted/50 px-3 py-2">
                      <span className="font-medium text-foreground">{app.applicationName}</span> · {app.license}{app.notes ? ` · ${app.notes}` : ''}
                    </div>
                  )) : <p>-</p>}
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none sm:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Aplikasi non-kerja</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  {viewCheck.nonWorkApplications.length ? viewCheck.nonWorkApplications.map((app, index) => (
                    <div key={`${app.applicationName}-${index}`} className="rounded-md bg-muted/50 px-3 py-2">
                      <span className="font-medium text-foreground">{app.applicationName}</span> · {app.license}{app.notes ? ` · ${app.notes}` : ''}
                    </div>
                  )) : <p>-</p>}
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Antivirus</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Status:</span> {viewCheck.security.antivirus.status}</p>
                  {viewCheck.security.antivirus.list.length ? viewCheck.security.antivirus.list.map((app, index) => <p key={`${app.applicationName}-${index}`}>{app.applicationName} · {app.license}{app.notes ? ` · ${app.notes}` : ''}</p>) : <p>-</p>}
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">VPN</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Status:</span> {viewCheck.security.vpn.status}</p>
                  {viewCheck.security.vpn.list.length ? viewCheck.security.vpn.list.map((vpn, index) => <p key={`${vpn.vpnName}-${index}`}>{vpn.vpnName} · {vpn.license}{vpn.notes ? ` · ${vpn.notes}` : ''}</p>) : <p>-</p>}
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Perangkat mobile</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  {viewCheck.mobileDevices?.length ? viewCheck.mobileDevices.map((device, index) => <p key={`${device.deviceName}-${index}`}><span className="font-medium text-foreground">{device.deviceName || '-'}</span> · {device.macAddress || '-'}</p>) : <p>-</p>}
                </CardContent>
              </Card>
              <Card className="border-muted shadow-none sm:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Informasi tambahan</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Password:</span> {viewCheck.additionalInfo.passwordUsage}</p>
                  <p><span className="font-medium text-foreground">PIC:</span> {viewCheck.additionalInfo.inspectorPICName || '-'}</p>
                  <div>
                    <p className="font-medium text-foreground">Catatan:</p>
                    <p className="mt-1 whitespace-pre-wrap break-words">{viewCheck.additionalInfo.otherNotes || (viewCheck.additionalInfo as { notes?: string }).notes || '-'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <DialogTitle>{t('employeeHistory.confirmDelete')}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            {t('employeeHistory.confirmDelete')}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
