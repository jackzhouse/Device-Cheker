'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart3,
  Monitor,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  FileDown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/layout/PageHeader';
import SummaryCard from '@/components/layout/SummaryCard';
import Link from 'next/link';
import { generateDeviceCheckPDF } from '@/lib/utils/pdf';

interface StatisticsData {
  totalChecks: number;
  totalEmployees: number;
  deviceTypes: { PC: number; Laptop: number };
  ownership: { Company: number; Personal: number };
  suitability: {
    Suitable: number;
    'Limited Suitability': number;
    'Needs Repair': number;
    Unsuitable: number;
  };
  osTypes: { Windows: number; Linux: number; Mac: number };
  osLicenses: { Original: number; Pirated: number; 'Open Source': number; Unknown: number };
  antivirusStatus: { Active: number; Inactive: number };
  vpnStatus: { Available: number; 'Not Available': number };
  urgentDevices: Array<{
    _id: string;
    employeeName: string;
    employeePosition: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    serialNumber: string;
    suitability: string;
    checkDate: string;
    version: number;
  }>;
  missingVersionV2: Array<{
    _id: string;
    employeeId: string;
    fullName: string;
    position: string;
    department?: string;
    latestVersion: number;
    lastCheckDate?: Date;
  }>;
  monthlyData: Array<{ month: string; count: number }>;
  departmentBreakdown: Record<string, number>;
  summary: {
    totalChecks: number;
    totalEmployees: number;
    totalPCs: number;
    totalLaptops: number;
    companyOwned: number;
    personalOwned: number;
    urgentDevicesCount: number;
    missingV2Count: number;
  };
}

const COLORS = {
  PC: '#3b82f6',
  Laptop: '#8b5cf6',
  Company: '#10b981',
  Personal: '#f59e0b',
  Suitable: '#10b981',
  'Limited Suitability': '#f59e0b',
  'Needs Repair': '#ef4444',
  Unsuitable: '#7c3aed',
  Windows: '#3b82f6',
  Linux: '#10b981',
  Mac: '#8b5cf6',
  Original: '#10b981',
  Pirated: '#ef4444',
  'Open Source': '#06b6d4',
  Unknown: '#6b7280',
  Active: '#10b981',
  Inactive: '#ef4444',
  Available: '#10b981',
  'Not Available': '#ef4444',
};

const CHART_TRANSLATION_KEYS = {
  suitability: {
    Suitable: 'suitable',
    'Limited Suitability': 'limitedSuitability',
    'Needs Repair': 'needsRepair',
    Unsuitable: 'unsuitable',
  },
  osLicense: {
    Original: 'original',
    Pirated: 'pirated',
    'Open Source': 'openSource',
    Unknown: 'unknown',
  },
} as const;

const CHART_OPTION_ALIASES = {
  suitability: {
    suitable: 'Suitable',
    limitedsuitability: 'Limited Suitability',
    needsrepair: 'Needs Repair',
    unsuitable: 'Unsuitable',
  },
  osType: {
    windows: 'Windows',
    win: 'Windows',
    linux: 'Linux',
    ubuntu: 'Linux',
    mac: 'Mac',
    macos: 'Mac',
    macosx: 'Mac',
  },
  osLicense: {
    original: 'Original',
    pirated: 'Pirated',
    bajakan: 'Pirated',
    opensource: 'Open Source',
    open: 'Open Source',
    unknown: 'Unknown',
    tidaktau: 'Unknown',
    tidakdiketahui: 'Unknown',
    notknown: 'Unknown',
    na: 'Unknown',
    none: 'Unknown',
  },
} as const;

function normalizeChartToken(value: string) {
  return value.toLowerCase().replace(/[\s_\-/.]/g, '');
}

function aggregateChartEntries(
  entries: Array<[string, number]>,
  aliases: Record<string, string>,
  fallbackName?: string,
) {
  const totals = new Map<string, number>();
  entries.forEach(([name, value]) => {
    const canonicalName = aliases[normalizeChartToken(name)] || fallbackName || name;
    totals.set(canonicalName, (totals.get(canonicalName) || 0) + value);
  });
  return Array.from(totals.entries());
}

export default function DashboardClient() {
  const { t, language } = useLanguage();
  const [data, setData] = React.useState<StatisticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState('all');

  const fetchData = async (range: string) => {
    if (data) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/statistics?timeRange=${range}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || t('dashboard.toast.fetchFailed'));
      setData(result.data);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('dashboard.toast.fetchFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportUrgentPDF = async (id: string) => {
    try {
      toast.loading(language === 'id' ? 'Membuat PDF...' : 'Generating PDF...', { id: 'urgentPdf' });
      const { getDeviceCheckById } = await import('@/lib/services/device-checks.service');
      const response = await getDeviceCheckById(id);
      if (!response.success || !response.data) throw new Error(language === 'id' ? 'Data pengecekan tidak ditemukan' : 'Check record not found');
      await generateDeviceCheckPDF(response.data);
      toast.dismiss('urgentPdf');
      toast.success(language === 'id' ? 'PDF berhasil diunduh' : 'PDF downloaded');
    } catch (error: unknown) {
      toast.dismiss('urgentPdf');
      toast.error(error instanceof Error ? error.message : (language === 'id' ? 'Gagal membuat PDF' : 'Failed to generate PDF'));
    }
  };

  React.useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="space-y-4" aria-label={t('common.loading')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]"><div className="h-64 animate-pulse rounded-xl bg-muted" /><div className="h-64 animate-pulse rounded-xl bg-muted" /></div>
          <div className="h-56 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-shell">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
            <p className="text-muted-foreground">{error || t('dashboard.toast.fetchFailed')}</p>
            <button type="button" className="filter-control" onClick={() => fetchData(timeRange)}>{t('common.retry')}</button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deviceTypeData = [
    { name: t('form.deviceDetail.deviceTypeOptions.pc'), value: data.deviceTypes.PC, color: COLORS.PC },
    { name: t('form.deviceDetail.deviceTypeOptions.laptop'), value: data.deviceTypes.Laptop, color: COLORS.Laptop },
  ];

  const ownershipData = [
    { name: t('form.deviceDetail.ownershipOptions.company'), value: data.ownership.Company, color: COLORS.Company },
    { name: t('form.deviceDetail.ownershipOptions.personal'), value: data.ownership.Personal, color: COLORS.Personal },
  ];

  const suitabilityData = aggregateChartEntries(Object.entries(data.suitability), CHART_OPTION_ALIASES.suitability)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`form.deviceCondition.suitabilityOptions.${CHART_TRANSLATION_KEYS.suitability[name as keyof typeof CHART_TRANSLATION_KEYS.suitability]}`),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  const osTypeData = aggregateChartEntries(Object.entries(data.osTypes), CHART_OPTION_ALIASES.osType)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`form.operatingSystem.osTypeOptions.${name.toLowerCase()}`),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  const osLicenseData = aggregateChartEntries(Object.entries(data.osLicenses), CHART_OPTION_ALIASES.osLicense, 'Unknown')
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`form.operatingSystem.osLicenseOptions.${CHART_TRANSLATION_KEYS.osLicense[name as keyof typeof CHART_TRANSLATION_KEYS.osLicense]}`),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  const antivirusData = [
    { name: t('form.security.statusOptions.active'), value: data.antivirusStatus.Active, color: COLORS.Active },
    { name: t('form.security.statusOptions.inactive'), value: data.antivirusStatus.Inactive, color: COLORS.Inactive },
  ];

  const vpnData = [
    { name: t('form.security.statusOptions.available'), value: data.vpnStatus.Available, color: COLORS.Available },
    {
      name: t('form.security.statusOptions.notAvailable'),
      value: data.vpnStatus['Not Available'],
      color: COLORS['Not Available'],
    },
  ];

  const departmentData = Object.entries(data.departmentBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const compactChart = (title: string, chart: React.ReactNode) => (
    <Link href="/data-pengecekan" className="block rounded-xl transition-transform hover:-translate-y-0.5" aria-label={`${title} — ${language === 'id' ? 'lihat data' : 'view records'}`}>
    <Card className="panel-card dashboard-chart-card">
      <CardHeader className="dashboard-chart-header">
        <CardTitle className="flex items-center justify-between gap-2">{title}<span className="text-[10px] font-normal text-primary">{language === 'id' ? 'Lihat data' : 'View records'} →</span></CardTitle>
      </CardHeader>
      <CardContent className="dashboard-chart-content">{chart}</CardContent>
    </Card>
    </Link>
  );

  const donut = (chartData: Array<{ name: string; value: number; color: string }>) => (
    <ResponsiveContainer width="100%" height={156} minHeight={140}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="44%" outerRadius={54} innerRadius={32} paddingAngle={2}>
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
        </Pie>
        <Tooltip />
        <Legend iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 2 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="page-shell dashboard-page">
      <PageHeader
        eyebrow="Overview"
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="filter-control w-full sm:w-auto">
              <option value="all">{t('dashboard.timeRange.all')}</option>
              <option value="30days">{t('dashboard.timeRange.last30Days')}</option>
              <option value="6months">{t('dashboard.timeRange.last6Months')}</option>
              <option value="1year">{t('dashboard.timeRange.last1Year')}</option>
            </select>
            <button type="button" className="filter-control inline-flex items-center gap-2" onClick={() => fetchData(timeRange)} disabled={refreshing} aria-label={language === 'id' ? 'Perbarui data dashboard' : 'Refresh dashboard data'}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? (language === 'id' ? 'Memperbarui...' : 'Refreshing...') : (language === 'id' ? 'Perbarui' : 'Refresh')}</span>
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground" aria-live="polite">
        <span>{lastUpdated ? `${language === 'id' ? 'Diperbarui' : 'Last updated'} ${lastUpdated.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : (language === 'id' ? 'Memuat data terbaru' : 'Loading latest data')}</span>
        {refreshing && <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 animate-spin" />{language === 'id' ? 'Memperbarui' : 'Refreshing'}</span>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/data-pengecekan" className="block rounded-xl transition-transform hover:-translate-y-0.5" aria-label={t('dashboard.summary.totalChecks')}><SummaryCard title={t('dashboard.summary.totalChecks')} value={data.totalChecks} icon={<BarChart3 className="h-5 w-5 text-blue-600" />} /></Link>
        <Link href="/karyawan" className="block rounded-xl transition-transform hover:-translate-y-0.5" aria-label={t('dashboard.summary.totalEmployees')}><SummaryCard title={t('dashboard.summary.totalEmployees')} value={data.totalEmployees} icon={<Monitor className="h-5 w-5 text-green-600" />} /></Link>
        <Link href="/data-pengecekan" className="block rounded-xl transition-transform hover:-translate-y-0.5" aria-label={t('dashboard.summary.totalDevices')}><SummaryCard title={t('dashboard.summary.totalDevices')} value={data.deviceTypes.PC + data.deviceTypes.Laptop} meta={`${data.deviceTypes.PC} ${t('dashboard.summary.totalPCs')} • ${data.deviceTypes.Laptop} ${t('dashboard.summary.totalLaptops')}`} icon={<TrendingUp className="h-5 w-5 text-purple-600" />} /></Link>
        <Link href="/data-pengecekan?suitability=Needs%20Repair" className="block rounded-xl transition-transform hover:-translate-y-0.5" aria-label={t('dashboard.summary.urgentDevices')}><SummaryCard title={t('dashboard.summary.urgentDevices')} value={data.urgentDevices.length} icon={<AlertTriangle className="h-5 w-5 text-red-600" />} /></Link>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        {data.monthlyData.length > 0 && (
          <Card className="panel-card dashboard-focus-card">
            <CardHeader className="dashboard-chart-header">
              <div>
                <div className="section-kicker">Activity</div>
                <CardTitle className="mt-1">{t('dashboard.charts.trendsOverTime')}</CardTitle>
              </div>
              <span className="dashboard-chart-note">{data.monthlyData.length} periods</span>
            </CardHeader>
            <CardContent className="dashboard-focus-content">
              <ResponsiveContainer width="100%" height={218} minHeight={180}>
                <LineChart data={data.monthlyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e6ebf1" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2867c7" strokeWidth={2.5} dot={{ r: 3, fill: '#2867c7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="panel-card dashboard-mix-card">
          <CardHeader className="dashboard-chart-header"><CardTitle>Portfolio mix</CardTitle></CardHeader>
          <CardContent className="space-y-4 dashboard-mix-content">
            <div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{t('dashboard.charts.deviceType')}</span><span className="type-mono font-semibold">{data.deviceTypes.PC + data.deviceTypes.Laptop}</span></div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted"><span className="bg-blue-500" style={{ width: `${(data.deviceTypes.PC / Math.max(1, data.deviceTypes.PC + data.deviceTypes.Laptop)) * 100}%` }} /><span className="bg-violet-500" style={{ width: `${(data.deviceTypes.Laptop / Math.max(1, data.deviceTypes.PC + data.deviceTypes.Laptop)) * 100}%` }} /></div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"><span>PC {data.deviceTypes.PC}</span><span>Laptop {data.deviceTypes.Laptop}</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{t('dashboard.charts.ownership')}</span><span className="type-mono font-semibold">{data.ownership.Company + data.ownership.Personal}</span></div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted"><span className="bg-emerald-500" style={{ width: `${(data.ownership.Company / Math.max(1, data.ownership.Company + data.ownership.Personal)) * 100}%` }} /><span className="bg-amber-500" style={{ width: `${(data.ownership.Personal / Math.max(1, data.ownership.Company + data.ownership.Personal)) * 100}%` }} /></div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"><span>Company {data.ownership.Company}</span><span>Personal {data.ownership.Personal}</span></div>
            </div>
            {departmentData.length > 0 && <div className="border-t border-[var(--app-border)] pt-3"><div className="data-label mb-2">Top departments</div>{departmentData.slice(0, 3).map((item) => <div key={item.name} className="mb-2 flex items-center justify-between gap-3 text-xs last:mb-0"><span className="truncate text-muted-foreground">{item.name}</span><span className="type-mono font-semibold">{item.value}</span></div>)}</div>}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between gap-3"><div><div className="section-kicker">Diagnostics</div><h2 className="mt-1 text-lg font-semibold tracking-[-.02em]">Device health snapshot</h2></div><span className="text-[11px] text-muted-foreground">{data.totalChecks} checks</span></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {compactChart(t('dashboard.charts.suitability'), donut(suitabilityData))}
          {compactChart(t('dashboard.charts.osType'), donut(osTypeData))}
          {compactChart(t('dashboard.charts.osLicense'), donut(osLicenseData))}
          {compactChart(t('dashboard.charts.antivirus'), donut(antivirusData))}
          {compactChart(t('dashboard.charts.vpn'), donut(vpnData))}
        </div>
      </div>

      <Card className="panel-card dashboard-urgent-card">
        <CardHeader className="dashboard-urgent-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">{t('dashboard.urgentDevices.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="dashboard-urgent-content">
          {data.urgentDevices.length === 0 ? (
            <div className="text-center py-5 text-muted-foreground">
              <p>{t('dashboard.urgentDevices.noUrgent')}</p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {data.urgentDevices.map((device) => (
                <div
                  key={device._id}
                  className="flex min-w-0 gap-3 rounded-md border border-[var(--app-border)] border-l-4 bg-[var(--app-surface)] p-3 shadow-xs transition-shadow hover:shadow-sm"
                  style={{ borderLeftColor: device.suitability === 'Needs Repair' ? '#ef4444' : '#7c3aed' }}
                >
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{device.employeeName}</div><div className="truncate text-xs text-muted-foreground">{device.employeePosition}</div><div className="mt-2 truncate text-xs"><span className="font-medium">{device.deviceType}</span> · {device.deviceBrand} {device.deviceModel}</div><div className="mt-1 truncate text-[11px] text-muted-foreground">Serial: {device.serialNumber}</div><div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant={
                            device.suitability === 'Needs Repair'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {device.suitability === 'Needs Repair'
                            ? t('dashboard.urgentDevices.needsRepair')
                            : t('dashboard.urgentDevices.unsuitable')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(device.checkDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                        </span>
                      </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Link className="rounded-md border px-2 py-1 text-center text-[11px] font-medium hover:bg-muted" href="/data-pengecekan">{t('dashboard.urgentDevices.viewDetails')}</Link>
                    <Link className="rounded-md bg-primary px-2 py-1 text-center text-[11px] font-medium text-primary-foreground hover:bg-primary/90" href={`/form/edit/${device._id}`}>{t('common.edit')}</Link>
                    <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-muted" onClick={() => exportUrgentPDF(device._id)}><FileDown className="h-3 w-3" />PDF</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
