'use client';

import * as React from 'react';
import { deleteDeviceCheck, getDeviceChecks, type DeviceCheck } from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/layout/FilterBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Edit, Trash2, Eye, Download,
  Laptop, HardDrive, Calendar, User, Building, AlertTriangle, Database, Table2, LayoutGrid
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateDeviceCheckPDF } from '@/lib/utils/pdf';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { normalizeDataForForm } from '@/lib/utils/data-normalizer';

export default function CheckDataPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [checks, setChecks] = React.useState<DeviceCheck[]>([]);
  const [pagination, setPagination] = React.useState({ page: Number(searchParams.get('page') || 1), totalPages: 1, total: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    suitability: searchParams.get('suitability') || '',
    ownership: searchParams.get('ownership') || '',
    version: '',
    showMissingVersion: searchParams.get('missing') === '1',
    targetVersion: searchParams.get('version') || '2',
    overdue: searchParams.get('overdue') === '1',
  });
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [groupByEmployee, setGroupByEmployee] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetSummary, setDeleteTargetSummary] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  React.useEffect(() => {
    const savedView = window.localStorage.getItem('device-checking-data-view');
    if (savedView === 'card' || savedView === 'table') setViewMode(savedView);
  }, []);

  const changeViewMode = (mode: 'table' | 'card') => {
    setViewMode(mode);
    window.localStorage.setItem('device-checking-data-view', mode);
  };

  React.useEffect(() => {
    fetchChecks();
  }, [filters, page, searchTerm]);

  React.useEffect(() => {
    const nextSearch = searchParams.get('q') || '';
    const nextPage = Number(searchParams.get('page') || 1);
    const nextSuitability = searchParams.get('suitability') || '';
    const nextOwnership = searchParams.get('ownership') || '';
    const nextMissing = searchParams.get('missing') === '1';
    const nextVersion = searchParams.get('version') || '2';
    const nextOverdue = searchParams.get('overdue') === '1';
    setSearchTerm((current) => current === nextSearch ? current : nextSearch);
    setPage((current) => current === nextPage ? current : nextPage);
    setFilters((current) => {
      if (current.suitability === nextSuitability && current.ownership === nextOwnership && current.showMissingVersion === nextMissing && current.targetVersion === nextVersion && current.overdue === nextOverdue) return current;
      return { ...current, suitability: nextSuitability, ownership: nextOwnership, showMissingVersion: nextMissing, targetVersion: nextVersion, overdue: nextOverdue };
    });
  }, [searchParams]);

  React.useEffect(() => {
    const query = new URLSearchParams();
    if (searchTerm) query.set('q', searchTerm);
    if (filters.suitability) query.set('suitability', filters.suitability);
    if (filters.ownership) query.set('ownership', filters.ownership);
    if (filters.showMissingVersion) {
      query.set('missing', '1');
      query.set('version', filters.targetVersion);
    }
    if (filters.overdue) query.set('overdue', '1');
    if (page > 1) query.set('page', String(page));
    const nextUrl = query.toString();
    if (searchParams.toString() !== nextUrl) {
      router.replace(`/data-pengecekan${nextUrl ? `?${nextUrl}` : ''}`, { scroll: false });
    }
  }, [filters, page, searchParams, searchTerm, router]);

  const fetchChecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 24, search: searchTerm };
      
      // Add version filter
      if (filters.version && !filters.showMissingVersion) {
        params.version = filters.version;
      }
      
      // Add missing version filter
      if (filters.showMissingVersion && filters.targetVersion) {
        params.missingVersion = filters.targetVersion;
      }
      if (filters.overdue) params.dateTo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await getDeviceChecks(params);
      if (!response.success || !response.data) throw new Error(t('checkData.toast.fetchFailed'));
      setChecks(response.data);
      setPagination({ page: response.pagination?.page || page, totalPages: response.pagination?.totalPages || 1, total: response.pagination?.total || response.data.length });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('checkData.toast.fetchFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    const target = checks.find((check) => check._id === id);
    setDeleteTargetSummary(target ? `${target.employeeSnapshot.fullName} · ${target.deviceDetail.deviceBrand} ${target.deviceDetail.deviceModel} · v${target.version}` : null);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteDeviceCheck(deleteTargetId);
      toast.success(t('checkData.toast.deleteSuccess'));
      fetchChecks();
    } catch (error: any) {
      toast.error(error.message || t('checkData.toast.deleteFailed'));
    } finally {
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetSummary(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => current.size === filteredChecks.length
      ? new Set()
      : new Set(filteredChecks.map((check) => check._id)));
  };

  const handleBulkExport = async () => {
    const selectedChecks = checks.filter((check) => selectedIds.has(check._id));
    if (!selectedChecks.length) return;
    toast.loading(language === 'id' ? 'Membuat PDF terpilih...' : 'Generating selected PDFs...', { id: 'bulkPdf' });
    try {
      for (const check of selectedChecks) await generateDeviceCheckPDF(check);
      toast.dismiss('bulkPdf');
      toast.success(language === 'id' ? `${selectedChecks.length} PDF selesai` : `${selectedChecks.length} PDFs downloaded`);
    } catch (error: unknown) {
      toast.dismiss('bulkPdf');
      toast.error(error instanceof Error ? error.message : t('checkData.toast.pdfFailed'));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await Promise.all(ids.map((id) => deleteDeviceCheck(id)));
      toast.success(language === 'id' ? `${ids.length} data dihapus` : `${ids.length} records deleted`);
      setSelectedIds(new Set());
      await fetchChecks();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('checkData.toast.deleteFailed'));
    } finally {
      setBulkDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetSummary(null);
  };

  const handleDownloadPDF = async (check: DeviceCheck) => {
    try {
      toast.loading(t('checkData.toast.pdfGenerating'), { id: 'pdfGenerating' });
      await generateDeviceCheckPDF(check);
      toast.dismiss('pdfGenerating');
      toast.success(t('checkData.toast.pdfSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('checkData.toast.pdfFailed'));
    }
  };

  // Helper to get badge variant from internal value
  const getSuitabilityBadgeVariant = (value: string) => {
    const variants: Record<string, string> = {
      'suitable': 'success',
      'limitedSuitability': 'warning',
      'needsRepair': 'destructive',
      'unsuitable': 'destructive',
    };
    // Handle old format for backward compatibility
    const oldVariants: Record<string, string> = {
      'Suitable': 'success',
      'Limited Suitability': 'warning',
      'Needs Repair': 'destructive',
      'Unsuitable': 'destructive',
    };
    return variants[value] || oldVariants[value] || 'default';
  };

  // Helper to get translated label from internal value
  const getSuitabilityLabel = (value: string) => {
    const keyMap: Record<string, string> = {
      'suitable': 'suitable',
      'limitedSuitability': 'limitedSuitability',
      'needsRepair': 'needsRepair',
      'unsuitable': 'unsuitable',
      // Old format for backward compatibility
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter checks
  const filteredChecks = checks.filter((check) => {
    const matchesSearch =
      check.employeeSnapshot?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.employeeSnapshot.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.employeeId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.deviceDetail.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.deviceDetail.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSuitability = !filters.suitability || check.deviceCondition.deviceSuitability?.toLowerCase() === filters.suitability?.toLowerCase();
    const matchesOwnership = !filters.ownership || check.deviceDetail.ownership?.toLowerCase() === filters.ownership?.toLowerCase();
    const matchesVersion = !filters.version || check.version === parseInt(filters.version);

    return matchesSearch && matchesSuitability && matchesOwnership && matchesVersion;
  });

  // Group checks by employee
  const groupedChecks = React.useMemo(() => {
    const groups = new Map<string, DeviceCheck[]>();
    filteredChecks.forEach((check) => {
      const key = check.employeeId.toString();
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(check);
    });
    // Use the string key (employeeId from map entries) instead of original employeeId
    return Array.from(groups.entries()).map(([key, employeeChecks]) => ({
      employeeId: key,
      checks: employeeChecks.sort((a, b) => b.version - a.version),
    }));
  }, [filteredChecks]);

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
    return <div className="page-shell"><Card role="alert"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><p className="text-muted-foreground">{error}</p><Button type="button" onClick={fetchChecks}>{t('common.retry')}</Button></CardContent></Card></div>;
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Records"
        title={t('checkData.title')}
        description={t('checkData.description')}
      />

      <FilterBar>
        <div className="mb-2 flex items-center justify-between gap-2 md:hidden">
          <span className="text-xs font-semibold text-foreground">{t('common.filter')}</span>
          <Button type="button" variant="outline" size="sm" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? t('common.cancel') : t('common.filter')}</Button>
        </div>
        <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-4 md:flex md:flex-row`}>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('checkData.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filters.suitability}
            onChange={(e) => { setFilters(prev => ({ ...prev, suitability: e.target.value })); setPage(1); }}
            className="filter-control"
          >
            <option value="">{t('checkData.filters.allSuitability')}</option>
            <option value="Suitable">{t('checkData.suitability.suitable')}</option>
            <option value="Limited Suitability">{t('checkData.suitability.limitedSuitability')}</option>
            <option value="Needs Repair">{t('checkData.suitability.needsRepair')}</option>
            <option value="Unsuitable">{t('checkData.suitability.unsuitable')}</option>
          </select>
          <Button type="button" variant={filters.suitability === 'Needs Repair' ? 'default' : 'outline'} onClick={() => { setPage(1); setFilters(prev => ({ ...prev, suitability: prev.suitability === 'Needs Repair' ? '' : 'Needs Repair' })); }}>
            <AlertTriangle className="mr-2 h-4 w-4" />{t('checkData.suitability.needsRepair')}
          </Button>
          <Button type="button" variant={filters.showMissingVersion ? 'default' : 'outline'} onClick={() => { setPage(1); setFilters(prev => ({ ...prev, showMissingVersion: !prev.showMissingVersion })); }}>
            {t('checkData.filters.missingVersion')}
          </Button>
          <Button type="button" variant={filters.overdue ? 'default' : 'outline'} onClick={() => { setPage(1); setFilters(prev => ({ ...prev, overdue: !prev.overdue })); }}>
            {language === 'id' ? 'Overdue >90 hari' : 'Overdue >90 days'}
          </Button>
          <select
            value={filters.ownership}
            onChange={(e) => { setFilters(prev => ({ ...prev, ownership: e.target.value })); setPage(1); }}
            className="filter-control"
          >
            <option value="">{t('checkData.filters.allOwnership')}</option>
            <option value="Company">{t('form.deviceDetail.ownershipOptions.company')}</option>
            <option value="Personal">{t('form.deviceDetail.ownershipOptions.personal')}</option>
          </select>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setPage(1); setFilters({ suitability: '', ownership: '', version: '', showMissingVersion: false, targetVersion: '2', overdue: false }); }}>
            {t('common.clear')}
          </Button>
        </div>
      </FilterBar>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
        <span>{pagination.total || filteredChecks.length} {t('checkData.resultsFound')}</span>
        <div className="flex flex-wrap items-center gap-2">
          {filteredChecks.length > 0 && <label className="inline-flex cursor-pointer items-center gap-1.5"><input type="checkbox" checked={selectedIds.size === filteredChecks.length} onChange={toggleSelectAll} aria-label={language === 'id' ? 'Pilih semua' : 'Select all'} />{language === 'id' ? 'Pilih semua' : 'Select all'}</label>}
          <div className="flex rounded-lg border border-[var(--app-border)] p-0.5" role="group" aria-label={language === 'id' ? 'Tampilan data' : 'Data view'}>
            <Button type="button" size="sm" variant={viewMode === 'table' ? 'secondary' : 'ghost'} aria-pressed={viewMode === 'table'} onClick={() => changeViewMode('table')} className="h-8 gap-1.5 px-2.5"><Table2 className="h-4 w-4" />{language === 'id' ? 'Tabel' : 'Table'}</Button>
            <Button type="button" size="sm" variant={viewMode === 'card' ? 'secondary' : 'ghost'} aria-pressed={viewMode === 'card'} onClick={() => changeViewMode('card')} className="h-8 gap-1.5 px-2.5"><LayoutGrid className="h-4 w-4" />{language === 'id' ? 'Kartu' : 'Cards'}</Button>
          </div>
          {pagination.totalPages > 1 && <span>{pagination.page}/{pagination.totalPages}</span>}
        </div>
      </div>
      {selectedIds.size > 0 && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-sm"><strong>{selectedIds.size} {language === 'id' ? 'dipilih' : 'selected'}</strong><Button size="sm" variant="outline" onClick={handleBulkExport}><Download className="mr-1.5 h-4 w-4" />{language === 'id' ? 'Ekspor terpilih' : 'Export selected'}</Button>{user?.role !== 'viewer' && <Button size="sm" variant="destructive" onClick={() => setBulkDeleteModalOpen(true)}><Trash2 className="mr-1.5 h-4 w-4" />{language === 'id' ? 'Hapus terpilih' : 'Delete selected'}</Button>}</div>}

      {/* Results */}
      {filteredChecks.length === 0 ? (
        <div className="empty-state">
          <Database className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('checkData.empty')}</p>
          {(searchTerm || filters.suitability || filters.ownership || filters.showMissingVersion || filters.overdue) && <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setPage(1); setFilters({ suitability: '', ownership: '', version: '', showMissingVersion: false, targetVersion: '2', overdue: false }); }}>{t('common.clear')}</Button>}
        </div>
      ) : groupByEmployee ? (
        // Grouped View
        <div className="space-y-3">
          {groupedChecks.map(({ employeeId, checks: employeeChecks }) => {
            const firstCheck = employeeChecks[0];
            const employee = firstCheck.employeeSnapshot;
            const displayEmployeeId = employee?.employeeId || firstCheck.employee?.employeeId || 'N/A';
            return (
              <Card key={employeeId}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.fullName}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        ID: {displayEmployeeId} • {employee.position}
                        {employee.department && ` • ${employee.department}`}
                      </p>
                      <Badge variant="secondary" className="mt-1.5">
                        {t('checkData.badge.total').replace('{count}', employeeChecks.length.toString())}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/data-pengecekan/${employeeId}`}>
                        {t('checkData.buttons.viewAllHistory')}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employeeChecks.slice(0, 3).map((check) => (
                      <CheckCard
                        key={check._id}
                        check={check}
                        onEdit={() => router.push(`/form/edit/${check._id}`)}
                        onDelete={() => handleDeleteClick(check._id)}
                        onDownload={() => handleDownloadPDF(check)}
                        canManage={user?.role !== 'viewer'}
                        selected={selectedIds.has(check._id)}
                        onToggleSelect={() => toggleSelected(check._id)}
                        compact
                      />
                    ))}
                    {employeeChecks.length > 3 && (
                      <Button variant="link" asChild className="w-full">
                        <Link href={`/data-pengecekan/${employeeId}`}>
                          {t('checkData.buttons.viewAllChecks').replace('{count}', employeeChecks.length.toString())}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        <CheckTable
          checks={filteredChecks}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelected}
          onEdit={(id) => router.push(`/form/edit/${id}`)}
          onDelete={handleDeleteClick}
          onDownload={handleDownloadPDF}
          canManage={user?.role !== 'viewer'}
        />
      ) : (
        // Card Grid View
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredChecks.map((check) => (
            <CheckCard
              key={check._id}
              check={check}
              onEdit={() => router.push(`/form/edit/${check._id}`)}
              onDelete={() => handleDeleteClick(check._id)}
              onDownload={() => handleDownloadPDF(check)}
              canManage={user?.role !== 'viewer'}
              selected={selectedIds.has(check._id)}
              onToggleSelect={() => toggleSelected(check._id)}
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

      {/* Delete Confirmation Modal */}
      {user?.role !== 'viewer' && (
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <DialogTitle>{t('common.delete')}?</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-2"><p>{t('checkData.confirmDelete')}</p>{deleteTargetSummary && <p className="rounded-md bg-destructive/10 p-2 text-sm font-medium text-destructive">{deleteTargetSummary}</p>}<p className="text-xs text-muted-foreground">{language === 'id' ? 'Data pengecekan ini akan dihapus permanen dan tidak dapat dipulihkan.' : 'This check record will be permanently deleted and cannot be recovered.'}</p></div>
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
      )}
      {user?.role !== 'viewer' && <Dialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{language === 'id' ? 'Hapus data terpilih?' : 'Delete selected records?'}</DialogTitle><DialogDescription>{language === 'id' ? `${selectedIds.size} data akan dihapus permanen dan tidak dapat dipulihkan.` : `${selectedIds.size} records will be permanently deleted and cannot be recovered.`}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>{t('common.cancel')}</Button><Button variant="destructive" onClick={handleBulkDeleteConfirm}>{t('common.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  );
}

function CheckTable({
  checks,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onDownload,
  canManage,
}: {
  checks: DeviceCheck[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (check: DeviceCheck) => void;
  canManage: boolean;
}) {
  const { t, language } = useLanguage();
  const formatDate = (value: string) => new Date(value).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const suitabilityKey: Record<string, string> = { Suitable: 'suitable', 'Limited Suitability': 'limitedSuitability', 'Needs Repair': 'needsRepair', Unsuitable: 'unsuitable' };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-card">
      <table className="w-full min-w-[920px] text-sm">
        <thead className="border-b border-[var(--app-border)] bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-3"><span className="sr-only">{language === 'id' ? 'Pilih' : 'Select'}</span></th>
            <th className="px-3 py-3 font-medium">{language === 'id' ? 'Karyawan' : 'Employee'}</th>
            <th className="px-3 py-3 font-medium">{language === 'id' ? 'Perangkat' : 'Device'}</th>
            <th className="px-3 py-3 font-medium">{language === 'id' ? 'Tanggal' : 'Date'}</th>
            <th className="px-3 py-3 font-medium">{language === 'id' ? 'Status' : 'Status'}</th>
            <th className="px-3 py-3 font-medium">{language === 'id' ? 'Aksi' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--app-border)]">
          {checks.map((check) => {
            const employee = check.employeeSnapshot;
            const suitability = suitabilityKey[check.deviceCondition.deviceSuitability] || check.deviceCondition.deviceSuitability;
            return (
              <tr key={check._id} className="transition-colors hover:bg-muted/30">
                <td className="px-3 py-3 align-top"><input type="checkbox" checked={selectedIds.has(check._id)} onChange={() => onToggleSelect(check._id)} aria-label={`${language === 'id' ? 'Pilih' : 'Select'} ${employee.fullName}`} className="h-4 w-4" /></td>
                <td className="px-3 py-3 align-top"><div className="font-medium">{employee.fullName}</div><div className="text-xs text-muted-foreground">{employee.employeeId || check.employee?.employeeId || 'N/A'}</div></td>
                <td className="px-3 py-3 align-top"><div className="font-medium">{check.deviceDetail.deviceBrand} {check.deviceDetail.deviceModel}</div><div className="text-xs text-muted-foreground">{check.deviceDetail.serialNumber || '-'} · v{check.version}</div></td>
                <td className="px-3 py-3 align-top whitespace-nowrap">{formatDate(check.checkDate)}</td>
                <td className="px-3 py-3 align-top"><Badge variant={suitability === 'needsRepair' || suitability === 'unsuitable' ? 'destructive' : suitability === 'limitedSuitability' ? 'warning' : 'success'}>{t(`checkData.suitability.${suitability}` as any)}</Badge></td>
                <td className="px-3 py-3 align-top"><div className="flex items-center gap-1.5"><Button variant="outline" size="sm" asChild><Link href={`/data-pengecekan/${check.employeeId?.toString() || ''}`}>{t('common.view')}</Link></Button><Button variant="outline" size="sm" onClick={() => onDownload(check)}>{t('common.download')}</Button>{canManage && <><Button variant="outline" size="sm" onClick={() => onEdit(check._id)}>{t('common.edit')}</Button><Button variant="destructive" size="sm" onClick={() => onDelete(check._id)}>{t('common.delete')}</Button></>}</div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CheckCard({
  check,
  onEdit,
  onDelete,
  onDownload,
  canManage,
  selected,
  onToggleSelect,
  compact = false
}: {
  check: DeviceCheck;
  onEdit: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  canManage: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  compact?: boolean;
}) {
  const { t, language } = useLanguage();

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

  const formatDate = (dateString: string) => {
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
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <input type="checkbox" checked={selected} onChange={onToggleSelect} aria-label={t('common.select.placeholder')} className="mt-1 h-4 w-4 shrink-0" />
            <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 text-primary" />
              {check.employeeSnapshot.fullName}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ID: {check.employeeSnapshot?.employeeId || check.employee?.employeeId || 'N/A'} • {check.deviceDetail.deviceBrand} - {check.deviceDetail.deviceModel}
            </p>
            </div>
          </div>
          <Badge variant="outline">v{check.version}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!compact && (
          <div className="mb-3 grid gap-1.5 text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2 text-xs">
              <Laptop className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{getDeviceTypeLabel(check.deviceDetail.deviceType)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{check.employeeSnapshot.position}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(check.checkDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span>{getOwnershipLabel(check.deviceDetail.ownership)}</span>
            </div>
          </div>
        )}

        <div className="mb-3">
          {getSuitabilityBadge(check.deviceCondition.deviceSuitability)}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" aria-label={t('common.tooltips.viewDetails')} asChild>
                <Link href={`/data-pengecekan/${check.employeeId?.toString() || ''}`}>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.view')}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.viewDetails')}</TooltipContent>
          </Tooltip>
          {onDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" aria-label={t('common.tooltips.downloadPDF')} onClick={onDownload}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.download')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.tooltips.downloadPDF')}</TooltipContent>
            </Tooltip>
          )}
          {canManage && (<>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.edit')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.editCheck')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1 min-w-[40px]" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('common.delete')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.deleteCheck')}</TooltipContent>
          </Tooltip>
          </>)}
        </div>
      </CardContent>
    </Card>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
