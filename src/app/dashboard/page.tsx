'use client';

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Monitor,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

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
  monthlyData: Array<{ month: string; count: number }>;
  departmentBreakdown: Record<string, number>;
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
  Linux: '#f59e0b',
  Mac: '#8b5cf6',
  Original: '#10b981',
  Pirated: '#ef4444',
  'Open Source': '#8b5cf6',
  Unknown: '#6b7280',
  Active: '#10b981',
  Inactive: '#ef4444',
  Available: '#10b981',
  'Not Available': '#ef4444',
};

// Animated Counter Component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// Fade In Animation Component
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = React.useState<StatisticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState('all');

  const fetchData = async (range: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/statistics?timeRange=${range}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error: any) {
      toast.error(error.message || t('dashboard.toast.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center flex items-center justify-center min-h-[60vh]">
          <div className="text-2xl font-semibold text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{t('dashboard.toast.fetchFailed')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const deviceTypeData = [
    { name: 'PC', value: data.deviceTypes.PC, color: COLORS.PC },
    { name: 'Laptop', value: data.deviceTypes.Laptop, color: COLORS.Laptop },
  ];

  const ownershipData = [
    { name: t('form.deviceDetail.ownershipOptions.company'), value: data.ownership.Company, color: COLORS.Company },
    { name: t('form.deviceDetail.ownershipOptions.personal'), value: data.ownership.Personal, color: COLORS.Personal },
  ];

  const suitabilityData = Object.entries(data.suitability)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`checkData.suitability.${name.toLowerCase().replace(' ', '')}`),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  const osTypeData = Object.entries(data.osTypes)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`form.operatingSystem.osTypeOptions.${name.toLowerCase()}`),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));

  const osLicenseData = Object.entries(data.osLicenses)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`form.operatingSystem.osLicenseOptions.${name.toLowerCase().replace(' ', '')}`),
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

  return (
    <div className="space-y-6 m-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">{t('dashboard.timeRange.all')}</option>
          <option value="30days">{t('dashboard.timeRange.last30Days')}</option>
          <option value="6months">{t('dashboard.timeRange.last6Months')}</option>
          <option value="1year">{t('dashboard.timeRange.last1Year')}</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FadeIn delay={100}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    <AnimatedCounter value={data.totalChecks} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dashboard.summary.totalChecks')}</div>
                </div>
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    <AnimatedCounter value={data.totalEmployees} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dashboard.summary.totalEmployees')}</div>
                </div>
                <Monitor className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={300}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    <AnimatedCounter value={data.deviceTypes.PC + data.deviceTypes.Laptop} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {data.deviceTypes.PC} {t('dashboard.summary.totalPCs')} • {data.deviceTypes.Laptop} {t('dashboard.summary.totalLaptops')}
                  </div>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={400}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    <AnimatedCounter value={data.urgentDevices.length} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dashboard.summary.urgentDevices')}</div>
                </div>
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Type Pie Chart */}
        <FadeIn delay={500}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.deviceType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={deviceTypeData} label nameKey="name" dataKey="value">
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Ownership Pie Chart */}
        <FadeIn delay={600}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.ownership')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ownershipData} label nameKey="name" dataKey="value">
                    {ownershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Suitability Bar Chart */}
        {suitabilityData.length > 0 && (
          <FadeIn delay={700}>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.charts.suitability')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={suitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Count">
                      {suitabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* OS Type Pie Chart */}
        {osTypeData.length > 0 && (
          <FadeIn delay={800}>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.charts.osType')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={osTypeData} label nameKey="name" dataKey="value">
                      {osTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* OS License Bar Chart */}
        {osLicenseData.length > 0 && (
          <FadeIn delay={900}>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.charts.osLicense')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={osLicenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Count">
                      {osLicenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Security Charts - Antivirus */}
        <FadeIn delay={1000}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.antivirus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={antivirusData} label nameKey="name" dataKey="value">
                    {antivirusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Security Charts - VPN */}
        <FadeIn delay={1100}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.charts.vpn')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={vpnData} label nameKey="name" dataKey="value">
                    {vpnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Trends Over Time - Line Chart */}
        {data.monthlyData.length > 0 && (
          <FadeIn delay={1200}>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.charts.trendsOverTime')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Department Breakdown */}
        {departmentData.length > 0 && (
          <FadeIn delay={1300}>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.charts.departmentBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" name="Checks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>

      {/* Urgent Devices Section */}
      <FadeIn delay={1400}>
        <Card className="border-red-200">
          <CardHeader className="border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">{t('dashboard.urgentDevices.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.urgentDevices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('dashboard.urgentDevices.noUrgent')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {data.urgentDevices.map((device) => (
                  <div
                    key={device._id}
                    className="flex items-start justify-between p-4 border-l-4 bg-red-50 rounded-lg"
                    style={{ borderLeftColor: device.suitability === 'Needs Repair' ? '#ef4444' : '#7c3aed' }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{device.employeeName}</div>
                      <div className="text-sm text-muted-foreground">{device.employeePosition}</div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>
                          <span className="font-medium">{device.deviceType}</span> - {device.deviceBrand} {device.deviceModel}
                        </div>
                        <div className="text-muted-foreground">Serial: {device.serialNumber}</div>
                        <div className="flex items-center gap-2 mt-2">
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
                          <span className="text-muted-foreground text-xs">
                            {new Date(device.checkDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}