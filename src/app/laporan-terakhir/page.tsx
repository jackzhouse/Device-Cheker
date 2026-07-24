'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    getLastCheckReport,
    type DeviceCheck,
    type LastCheckReportData
} from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import SummaryCard from '@/components/layout/SummaryCard';
import FilterBar from '@/components/layout/FilterBar';
import TableSurface from '@/components/layout/TableSurface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Search,
    Filter,
    X,
    Eye,
    Download,
    Users,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Laptop,
    Monitor,
    Calendar,
    Building,
    ChevronDown,
    ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { generateDeviceCheckPDF } from '@/lib/utils/pdf';
import { exportReportToExcel, exportReportToPDF } from '@/lib/utils/report-export';
import { Skeleton } from '@/components/ui/skeleton';

export default function LastCheckReportPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<DeviceCheck[]>([]);
    const [summary, setSummary] = useState<LastCheckReportData['summary'] | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [suitabilityFilter, setSuitabilityFilter] = useState('');
    const [ownershipFilter, setOwnershipFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Sorting
    const [sortField, setSortField] = useState<'status' | 'date'>('status');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

    useEffect(() => {
        fetchReport();
    }, [suitabilityFilter, ownershipFilter, dateFrom, dateTo]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params: any = {
                suitability: suitabilityFilter,
                ownership: ownershipFilter,
                dateFrom,
                dateTo
            };

            const response = await getLastCheckReport(params);
            if (response.success && response.data) {
                console.log(response.data)
                setData(response.data.data);
                setSummary(response.data.summary);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSuitabilityFilter('');
        setOwnershipFilter('');
        setDeptFilter('');
        setDateFrom('');
        setDateTo('');
    };

    // Client-side filtering for search and department
    const filteredData = useMemo(() => {
        if (data)
            return data.filter(item => {
                const matchesSearch = !searchTerm ||
                    item.employeeSnapshot.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.employeeSnapshot.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.deviceDetail.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.deviceDetail.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesDept = !deptFilter ||
                    item.employeeSnapshot.department?.toLowerCase().includes(deptFilter.toLowerCase());

                return matchesSearch && matchesDept;
            });
        return []
    }, [data, searchTerm, deptFilter]);

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

    const handleExportExcel = () => {
        if (!filteredData.length) return toast.error('No data to export');
        setExporting('excel');
        try {
            exportReportToExcel(filteredData);
            toast.success('Excel file downloaded');
        } catch (e: any) {
            toast.error(e.message || 'Export failed');
        } finally {
            setExporting(null);
        }
    };

    const handleExportPDF = async () => {
        if (!filteredData.length) return toast.error('No data to export');
        setExporting('pdf');
        try {
            await exportReportToPDF(filteredData);
            toast.success('PDF downloaded');
        } catch (e: any) {
            toast.error(e.message || 'Export failed');
        } finally {
            setExporting(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Suitable': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
            case 'Limited Suitability': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
            case 'Needs Repair': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
            case 'Unsuitable': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusBadge = (status: string) => {
        const variantMap: Record<string, any> = {
            'Suitable': 'success',
            'Limited Suitability': 'warning',
            'Needs Repair': 'destructive', // Using destructive for orange too if toast/variant is limited
            'Unsuitable': 'destructive'
        };

        // Custom label translation
        const labelMap: Record<string, string> = {
            'Suitable': t('checkData.suitability.suitable'),
            'Limited Suitability': t('checkData.suitability.limitedSuitability'),
            'Needs Repair': t('checkData.suitability.needsRepair'),
            'Unsuitable': t('checkData.suitability.unsuitable')
        };

        return (
            <Badge variant={variantMap[status] || 'secondary'} className="whitespace-nowrap">
                {labelMap[status] || status}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };


    return (
        <div className="page-shell">
            <PageHeader
                eyebrow="Reports"
                title={t('lastCheckReport.title')}
                description={t('lastCheckReport.description')}
                actions={
                    <div className='flex gap-2'>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportExcel}
                            disabled={exporting !== null || loading}
                            className="gap-2"
                        >
                            {exporting === 'excel' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                <Download className="h-4 w-4 text-green-600" />
                            )}
                            Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPDF}
                            disabled={exporting !== null || loading}
                            className="gap-2"
                        >
                            {exporting === 'pdf' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                <Download className="h-4 w-4 text-red-500" />
                            )}
                            Export PDF
                        </Button>
                    </div>
                }
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={t('lastCheckReport.summary.totalEmployees')}
                    value={summary?.total || 0}
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('lastCheckReport.summary.suitable')}
                    value={summary?.suitable || 0}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('lastCheckReport.summary.issues')}
                    value={(summary?.limitedSuitability || 0) + (summary?.needsRepair || 0)}
                    icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('lastCheckReport.summary.unsuitable')}
                    value={summary?.unsuitable || 0}
                    icon={<XCircle className="h-5 w-5 text-red-500" />}
                    loading={loading}
                />
            </div>

            {/* Filters Card */}
            <FilterBar>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {/* Search */}
                        <div className="space-y-1.5 flex-1">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('lastCheckReport.filters.searchPlaceholder')}
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Suitability Filter */}
                        <select
                            className="filter-control w-full"
                            value={suitabilityFilter}
                            onChange={(e) => setSuitabilityFilter(e.target.value)}
                        >
                            <option value="">{t('lastCheckReport.filters.allStatuses')}</option>
                            <option value="suitable">{t('checkData.suitability.suitable')}</option>
                            <option value="limitedSuitability">{t('checkData.suitability.limitedSuitability')}</option>
                            <option value="needsRepair">{t('checkData.suitability.needsRepair')}</option>
                            <option value="unsuitable">{t('checkData.suitability.unsuitable')}</option>
                        </select>

                        {/* Ownership Filter */}
                        <select
                            className="filter-control w-full"
                            value={ownershipFilter}
                            onChange={(e) => setOwnershipFilter(e.target.value)}
                        >
                            <option value="">{t('lastCheckReport.filters.allOwnership')}</option>
                            <option value="company">{t('form.deviceDetail.ownershipOptions.company')}</option>
                            <option value="personal">{t('form.deviceDetail.ownershipOptions.personal')}</option>
                        </select>

                        {/* Dept Search */}
                        <Input
                            placeholder={t('lastCheckReport.filters.allDepartments')}
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        />

                        {/* Date Range */}
                        <div className="flex gap-2 xl:col-span-1">
                            <Input
                                type="date"
                                className="w-full text-xs"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 xl:col-span-1">
                            <Input
                                type="date"
                                className="w-full text-xs"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                            <X className="mr-2 h-4 w-4" />
                            {t('lastCheckReport.filters.clearFilters')}
                        </Button>
                    </div>
            </FilterBar>

            {/* Report Table */}
            <Card className="panel-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[50px] text-center">{t('lastCheckReport.table.no')}</TableHead>
                                <TableHead>{t('lastCheckReport.table.employee')}</TableHead>
                                <TableHead className="hidden lg:table-cell">{t('lastCheckReport.table.department')}</TableHead>
                                <TableHead>{t('lastCheckReport.table.device')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('lastCheckReport.table.os')}</TableHead>
                                <TableHead className="text-center">{t('lastCheckReport.table.status')}</TableHead>
                                <TableHead className="hidden xl:table-cell">Condition & Notes</TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => {
                                    setSortField('date');
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}>
                                    <div className="flex items-center justify-end gap-1">
                                        {t('lastCheckReport.table.checkDate')}
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">{t('lastCheckReport.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                // Skeleton Rows
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                        <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="rounded-full bg-muted p-3">
                                                <Monitor className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium">
                                                {searchTerm || suitabilityFilter || ownershipFilter || deptFilter || dateFrom || dateTo
                                                    ? t('lastCheckReport.noResults')
                                                    : t('lastCheckReport.empty')}
                                            </p>
                                            {(searchTerm || suitabilityFilter || ownershipFilter || deptFilter || dateFrom || dateTo) && (
                                                <Button variant="link" onClick={clearFilters}>
                                                    {t('lastCheckReport.filters.clearFilters')}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((check, index) => {
                                    const suitability = check.deviceCondition.deviceSuitability;
                                    const rowClass =
                                        suitability === 'Unsuitable' ? 'bg-red-50/30 dark:bg-red-950/10' :
                                            suitability === 'Needs Repair' ? 'bg-orange-50/20 dark:bg-orange-950/5' : '';

                                    return (
                                        <TableRow key={check._id} className={`${rowClass} group transition-colors hover:bg-muted/30 border-l-4 ${suitability === 'Suitable' ? 'border-l-green-500' :
                                            suitability === 'Limited Suitability' ? 'border-l-yellow-500' :
                                                suitability === 'Needs Repair' ? 'border-l-orange-500' :
                                                    suitability === 'Unsuitable' ? 'border-l-red-500' : 'border-l-transparent'
                                            }`}>
                                            <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {check.employeeSnapshot.fullName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{check.employeeSnapshot.employeeId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Building className="h-3.5 w-3.5" />
                                                    {check.employeeSnapshot.department || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium">{check.deviceDetail.deviceBrand} {check.deviceDetail.deviceModel}</span>
                                                    <div className="flex gap-1.5">
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 uppercase">
                                                            {check.deviceDetail.deviceType}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">{check.deviceDetail.ownership}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-xs">{check.operatingSystem.osType} {check.operatingSystem.osVersion}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(suitability)}
                                            </TableCell>
                                            {/* Condition & Notes column */}
                                            <TableCell className="hidden xl:table-cell max-w-[220px]">
                                                <div className="flex flex-col gap-1">
                                                    {/* Device condition pills */}
                                                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                                                        {[
                                                            { label: 'Bat', value: check.deviceCondition.batterySuitability },
                                                            { label: 'KB', value: check.deviceCondition.keyboardCondition },
                                                            { label: 'TP', value: check.deviceCondition.touchpadCondition },
                                                            { label: 'Mon', value: check.deviceCondition.monitorCondition },
                                                            { label: 'WiFi', value: check.deviceCondition.wifiCondition },
                                                        ].map(({ label, value }) => (
                                                            <span key={label} className="text-[10px] text-muted-foreground" title={`${label}: ${value}`}>
                                                                <span className="font-medium text-foreground/60">{label}:</span>{' '}
                                                                <span className="truncate">{value || '-'}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {/* Notes */}
                                                    {check.additionalInfo?.otherNotes && (
                                                        <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px]" title={check.additionalInfo.otherNotes}>
                                                            {check.additionalInfo.otherNotes}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {formatDate(check.checkDate)}
                                                    </div>
                                                    <Badge variant="secondary" className="mt-1 text-[9px] h-3.5 px-1 py-0 bg-muted text-muted-foreground">
                                                        v{check.version}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => router.push(`/data-pengecekan/${check.employeeId}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-blue-500/10 hover:text-blue-500"
                                                        onClick={() => handleDownloadPDF(check)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, loading }: { title: string, value: number, icon: React.ReactNode, loading: boolean }) {
    return (
        <Card className="panel-card overflow-hidden bg-card">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <p className="text-2xl font-bold">{value}</p>
                        )}
                    </div>
                    <div className="rounded-xl bg-background p-2 shadow-xs border border-muted">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
