'use client';

import * as React from 'react';
import {
  getEmployeeSyncJob,
  getEmployees,
  syncEmployees,
  cancelEmployeeSyncJob,
  type Employee,
  type EmployeeSyncJob,
  type EmployeeSyncSummary,
} from '@/lib/services/employees.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/layout/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User, UserPlus, Edit, Trash2, History, Search, Download, FileSpreadsheet, AlertTriangle, RefreshCw, Table2, LayoutGrid
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { getKatalisAccessToken } from '@/lib/auth/browser-token';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [pagination, setPagination] = React.useState({ page: Number(searchParams.get('page') || 1), totalPages: 1, total: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterDept, setFilterDept] = useState(searchParams.get('department') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterNeverChecked, setFilterNeverChecked] = useState(searchParams.get('neverChecked') === '1');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncJob, setSyncJob] = useState<EmployeeSyncJob | null>(null);
  const [syncSummary, setSyncSummary] = useState<EmployeeSyncSummary | null>(null);

  React.useEffect(() => {
    const savedView = window.localStorage.getItem('device-checking-employee-view');
    if (savedView === 'card' || savedView === 'table') setViewMode(savedView);
  }, []);

  const changeViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    window.localStorage.setItem('device-checking-employee-view', mode);
  };

  // Import states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  
  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetChecks, setDeleteTargetChecks] = useState<number>(0);

  React.useEffect(() => {
    fetchEmployees();
  }, [page, searchTerm, filterDept, filterStatus, filterNeverChecked]);

  React.useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setFilterDept(searchParams.get('department') || '');
    setFilterStatus(searchParams.get('status') || '');
    setFilterNeverChecked(searchParams.get('neverChecked') === '1');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  React.useEffect(() => {
    const query = new URLSearchParams();
    if (searchTerm) query.set('q', searchTerm);
    if (filterDept) query.set('department', filterDept);
    if (filterStatus) query.set('status', filterStatus);
    if (filterNeverChecked) query.set('neverChecked', '1');
    if (page > 1) query.set('page', String(page));
    const nextUrl = query.toString();
    if (searchParams.toString() !== nextUrl) router.replace(`/karyawan${nextUrl ? `?${nextUrl}` : ''}`, { scroll: false });
  }, [filterDept, filterNeverChecked, filterStatus, page, router, searchParams, searchTerm]);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/employees/import/template');
      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_import_karyawan.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template berhasil diunduh');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunduh template');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Pilih file untuk diimpor');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Impor gagal');
      }

      setImportResults(result.results);
      toast.success(
        `${result.results.imported} karyawan berhasil diimpor. ${result.results.failed} gagal.`
      );

      // Refresh employee list
      fetchEmployees();

      // Close modal after 2 seconds if no errors
      if (result.results.failed === 0) {
        setTimeout(() => {
          setImportModalOpen(false);
          setImportFile(null);
          setImportResults(null);
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengimpor karyawan');
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    setImportResults(null);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmployees({ page, limit: 24, search: searchTerm, department: filterDept, status: filterStatus, hasChecks: filterNeverChecked ? 'false' : undefined });
      if (!response.success || !response.data) throw new Error(t('employee.toast.fetchFailed'));
      setEmployees(response.data);
      setPagination({ page: response.pagination?.page || page, totalPages: response.pagination?.totalPages || 1, total: response.pagination?.total || response.data.length });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('employee.toast.fetchFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!syncJob || !['queued', 'running'].includes(syncJob.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await getEmployeeSyncJob(syncJob.id);
        const job = response.data;
        if (!job) return;
        setSyncJob(job);
        setSyncSummary(job.summary);
        if (job.status === 'completed') {
          toast.success(`Sinkronisasi selesai: ${job.summary.created} ditambahkan, ${job.summary.updated} diperbarui, ${job.summary.skipped} dilewati`);
          setSyncing(false);
          await fetchEmployees();
        }
        if (job.status === 'failed') {
          toast.error(job.error || 'Sinkronisasi gagal');
          setSyncing(false);
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat perkembangan sinkronisasi');
        setSyncing(false);
      }
    }, 1200);

    return () => window.clearInterval(timer);
  }, [syncJob]);

  const handleSyncEmployees = async () => {
    const credentialToken = getKatalisAccessToken();
    if (!credentialToken) {
      toast.error('Token login tidak tersedia. Silakan login ulang.');
      return;
    }

    setSyncing(true);
    setSyncSummary(null);
    setSyncJob(null);
    try {
      const response = await syncEmployees(credentialToken);
      const job = response.data;
      if (!job) throw new Error('Sync job tidak dibuat');
      setSyncJob(job);
      setSyncSummary(job.summary);
      toast.success('Sinkronisasi karyawan dimulai');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyinkronkan karyawan');
      setSyncing(false);
    }
  };

  const handleCancelSync = async () => {
    if (!syncJob || !['queued', 'running'].includes(syncJob.status)) return;
    try {
      const response = await cancelEmployeeSyncJob(syncJob.id);
      if (response.data) {
        setSyncJob(response.data);
        setSyncSummary(response.data.summary);
      }
      setSyncing(false);
      toast.success('Sinkronisasi karyawan dibatalkan');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal membatalkan sinkronisasi');
    }
  };

  const handleDeleteClick = (id: string, totalChecks: number) => {
    setDeleteTargetId(id);
    setDeleteTargetChecks(totalChecks);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      const { deleteEmployee } = await import('@/lib/services/employees.service');
      await deleteEmployee(deleteTargetId);
      toast.success(t('employee.toast.deleteSuccess'));
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message || t('employee.toast.deleteFailed'));
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetChecks(0);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetChecks(0);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'Active': 'success',
      'Inactive': 'warning',
      'Resigned': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const syncProgress = syncJob?.status === 'completed'
    ? 100
    : syncJob?.totalPages
      ? Math.min(99, Math.round(((syncJob.page + 1) / syncJob.totalPages) * 100))
      : syncJob
        ? 8
        : 0;
  const estimatedItems = syncJob?.totalPages ? syncJob.totalPages * syncJob.size : null;

  // Get unique departments
  const departments = React.useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !filterDept || employee.department === filterDept;
    const matchesStatus = !filterStatus || employee.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page-shell">
        <div className="space-y-3" aria-label={t('common.loading')}>
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="page-shell"><Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="text-muted-foreground">{error}</p><Button type="button" onClick={fetchEmployees}>{t('common.retry')}</Button></CardContent></Card></div>;
  }


  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Directory"
        title={t('employee.title')}
        description={t('employee.description')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {user?.role === 'admin' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setSyncDialogOpen(true)} disabled={syncing}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Employee
                </Button>
                <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button asChild className="flex-1 sm:flex-none">
                  <Link href="/karyawan/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('employee.addButton')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Filters */}
      <FilterBar>
        <div className="mb-2 flex items-center justify-between gap-2 md:hidden">
          <span className="text-xs font-semibold text-foreground">{t('common.filter')}</span>
          <Button type="button" variant="outline" size="sm" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? t('common.cancel') : t('common.filter')}</Button>
        </div>
        <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-3 md:flex md:flex-row`}>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('employee.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
              className="filter-control"
            >
              <option value="">{t('employee.filters.allDepartments')}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <Button type="button" variant={filterNeverChecked ? 'default' : 'outline'} onClick={() => { setFilterNeverChecked((current) => !current); setPage(1); }}>
              {language === 'id' ? 'Belum pernah dicek' : 'Never checked'}
            </Button>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="filter-control"
            >
              <option value="">{t('employee.filters.allStatuses')}</option>
              <option value="Active">{t('createEmployee.statusOptions.active')}</option>
              <option value="Inactive">{t('createEmployee.statusOptions.inactive')}</option>
              <option value="Resigned">{t('createEmployee.statusOptions.resigned')}</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setFilterDept('');
                setFilterStatus('');
                setSearchTerm('');
                setFilterNeverChecked(false);
                setPage(1);
              }}
            >
              {t('common.clear')}
            </Button>
          </div>
      </FilterBar>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
        <span>{pagination.total || filteredEmployees.length} {t('employee.resultsFound')}</span>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--app-border)] p-0.5" role="group" aria-label={language === 'id' ? 'Tampilan karyawan' : 'Employee view'}>
            <Button type="button" size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} aria-pressed={viewMode === 'table'} onClick={() => changeViewMode('table')} className="h-8 gap-1.5 px-2.5"><Table2 className="h-4 w-4" />{language === 'id' ? 'Tabel' : 'Table'}</Button>
            <Button type="button" size="sm" variant={viewMode === 'card' ? 'secondary' : 'ghost'} aria-pressed={viewMode === 'card'} onClick={() => changeViewMode('card')} className="h-8 gap-1.5 px-2.5"><LayoutGrid className="h-4 w-4" />{language === 'id' ? 'Kartu' : 'Cards'}</Button>
          </div>
          {pagination.totalPages > 1 && <span>{pagination.page}/{pagination.totalPages}</span>}
        </div>
      </div>

      {/* Results */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <User className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('employee.empty')}</p>
          {(searchTerm || filterDept || filterStatus || filterNeverChecked) && <Button variant="outline" className="mt-4" onClick={() => { setFilterDept(''); setFilterStatus(''); setSearchTerm(''); setFilterNeverChecked(false); setPage(1); }}>{t('common.clear')}</Button>}
        </div>
      ) : viewMode === 'table' ? (
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={(id) => router.push(`/karyawan/${id}/edit`)}
          onDelete={(employee) => handleDeleteClick(employee._id, employee.totalDeviceChecks)}
          canManage={user?.role === 'admin'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={() => router.push(`/karyawan/${employee._id}/edit`)}
              onDelete={() => handleDeleteClick(employee._id, employee.totalDeviceChecks)}
              canManage={user?.role === 'admin'}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>{t('common.back')}</Button>
          <span className="px-2 text-xs text-muted-foreground">{page} / {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>{t('common.next')}</Button>
        </div>
      )}

      {/* Import Modal */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
          <DialogTitle>Sinkronkan data karyawan</DialogTitle>
            <DialogDescription>
              Data karyawan akan diperbarui dari Attendance. Data pengecekan perangkat tidak berubah.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {syncJob && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {syncJob.status === 'completed' ? 'Selesai' : syncJob.status === 'failed' ? 'Gagal' : syncJob.status === 'cancelled' ? 'Dibatalkan' : 'Sedang berjalan'}
                  </span>
                  <span className="tabular-nums">{syncProgress}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Perkembangan sinkronisasi karyawan"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={syncProgress}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${syncJob.status === 'failed' ? 'bg-destructive' : syncJob.status === 'cancelled' ? 'bg-muted-foreground' : 'bg-primary'}`}
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {syncJob.totalPages ? `Halaman ${Math.min(syncJob.page + 1, syncJob.totalPages)}/${syncJob.totalPages}` : 'Menyiapkan data...'}
                  </span>
                  <span>{estimatedItems ? `Perkiraan hingga ${estimatedItems} karyawan` : 'Menghitung perkiraan data...'}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pembaruan terakhir: {formatDateTime(syncJob.updatedAt)}</p>
              </div>
            )}
            {syncSummary && (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-subtle)] p-3 text-sm text-muted-foreground">
                Ditambahkan: {syncSummary.created} · Diperbarui: {syncSummary.updated} · Dilewati: {syncSummary.skipped} · Gagal: {syncSummary.failed}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>Tutup</Button>
            {syncing && (
              <Button variant="destructive" onClick={handleCancelSync}>Batalkan</Button>
            )}
            <Button onClick={handleSyncEmployees} disabled={syncing}>
              {syncing ? 'Menyinkronkan...' : syncJob?.status === 'failed' ? 'Coba lagi' : 'Mulai sinkronisasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importModalOpen} onOpenChange={handleCloseImportModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impor karyawan dari Excel</DialogTitle>
            <DialogDescription>
              Unggah file Excel berisi data karyawan. Kolom "Nama Lengkap" dan "Bagian" wajib diisi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!importResults ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportFile}
                    className="max-w-sm"
                    disabled={importing}
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      File terpilih: {importFile.name}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Kolom wajib:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Nama Lengkap</strong> - Nama lengkap</li>
                    <li><strong>Bagian</strong> - Posisi atau jabatan</li>
                  </ul>
                  <p className="font-medium mt-3 mb-2">Kolom opsional:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Departemen/Divisi</strong> - Departemen</li>
                    <li><strong>Nomor Induk Karyawan</strong> - Dibuat otomatis jika kosong</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{importResults.imported}</p>
                    <p className="text-sm text-green-600">Berhasil</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{importResults.failed}</p>
                    <p className="text-sm text-red-600">Gagal</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{importResults.total}</p>
                    <p className="text-sm text-blue-600">Total</p>
                  </div>
                </div>

                {importResults.failed > 0 && (
                  <div>
                    <p className="font-medium mb-2">Baris gagal:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {importResults.failedData.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg text-sm">
                          <p className="font-medium text-red-700">Baris {item.row}: {item.error}</p>
                          <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                            {JSON.stringify(item.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.imported > 0 && (
                  <div>
                    <p className="font-medium mb-2">Berhasil diimpor:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {importResults.successData.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-green-50 rounded-lg text-sm">
                          <p className="font-medium text-green-700">
                            Baris {item.row}: {item.name} ({item.employeeId})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!importResults ? (
              <>
                <Button variant="outline" onClick={handleCloseImportModal} disabled={importing}>
                  Batal
                </Button>
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? 'Mengimpor...' : 'Impor'}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseImportModal}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <DialogTitle>{t('employee.confirmDelete')}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            {deleteTargetChecks > 0
              ? t('employee.confirmDeleteWithChecks').replace('{count}', deleteTargetChecks.toString())
              : t('employee.confirmDelete')}
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

function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  canManage,
}: {
  employees: Employee[];
  onEdit: (id: string) => void;
  onDelete: (employee: Employee) => void;
  canManage: boolean;
}) {
  const { t, language } = useLanguage();
  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
  const statusVariant: Record<string, string> = { Active: 'success', Inactive: 'warning', Resigned: 'secondary' };
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-[var(--app-border)] bg-muted/40 text-left text-xs text-muted-foreground"><tr><th className="px-3 py-3 font-medium">{t('employee.employeeId')}</th><th className="px-3 py-3 font-medium">{language === 'id' ? 'Nama' : 'Name'}</th><th className="px-3 py-3 font-medium">{t('employee.department')}</th><th className="px-3 py-3 font-medium">{t('employee.totalChecks')}</th><th className="px-3 py-3 font-medium">{t('employee.lastCheck')}</th><th className="px-3 py-3 font-medium">{language === 'id' ? 'Status' : 'Status'}</th><th className="px-3 py-3 font-medium">{language === 'id' ? 'Aksi' : 'Actions'}</th></tr></thead>
        <tbody className="divide-y divide-[var(--app-border)]">
          {employees.map((employee) => <tr key={employee._id} className="transition-colors hover:bg-muted/30"><td className="px-3 py-3 font-medium">{employee.employeeId}</td><td className="px-3 py-3"><div className="font-medium">{employee.fullName}</div><div className="text-xs text-muted-foreground">{employee.position}</div></td><td className="px-3 py-3">{employee.department || '-'}</td><td className="px-3 py-3 tabular-nums">{employee.totalDeviceChecks}</td><td className="px-3 py-3 whitespace-nowrap">{formatDate(employee.lastCheckDate)}</td><td className="px-3 py-3"><Badge variant={statusVariant[employee.status] as any}>{t(`createEmployee.statusOptions.${employee.status.toLowerCase()}`)}</Badge></td><td className="px-3 py-3"><div className="flex items-center gap-1.5"><Button variant="outline" size="sm" asChild><Link href={`/data-pengecekan/${employee._id}`}>{t('common.view')}</Link></Button>{canManage && <><Button variant="outline" size="sm" onClick={() => onEdit(employee._id)}>{t('common.edit')}</Button><Button variant="destructive" size="sm" onClick={() => onDelete(employee)}>{t('common.delete')}</Button></>}</div></td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  canManage,
}: {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const { t, language } = useLanguage();

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'Active': 'success',
      'Inactive': 'warning',
      'Resigned': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{t(`createEmployee.statusOptions.${status.toLowerCase()}`)}</Badge>;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="panel-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base">{employee.fullName}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {employee.position}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('employee.employeeId')}: {employee.employeeId}
              </p>
            </div>
          </div>
          {getStatusBadge(employee.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid gap-1.5 text-xs sm:grid-cols-2">
          {employee.department && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('employee.department')}:</span>
              <span className="font-medium">{employee.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('employee.totalChecks')}:</span>
            <span className="font-medium">{employee.totalDeviceChecks}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t('employee.lastCheck')}:</span>
            <span className="font-medium">
              {formatDate(employee.lastCheckDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" aria-label={t('common.tooltips.viewHistory')} asChild>
                <Link href={`/data-pengecekan/${employee._id}`}>
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.view')}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.viewHistory')}</TooltipContent>
          </Tooltip>
          {canManage && (<>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" aria-label={t('common.tooltips.editEmployee')} onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.edit')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.editEmployee')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1 min-w-[40px]" aria-label={t('common.tooltips.deleteEmployee')} onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.delete')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.deleteEmployee')}</TooltipContent>
          </Tooltip>
          </>)}
        </div>
      </CardContent>
    </Card>
  );
}
