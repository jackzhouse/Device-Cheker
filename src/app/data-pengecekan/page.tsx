'use client';

import * as React from 'react';
import { getDeviceChecks, type DeviceCheck } from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Edit, Trash2, Eye, Download, Filter, 
  Laptop, HardDrive, Calendar, User, Building 
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateDeviceCheckPDF } from '@/lib/utils/pdf';

export default function CheckDataPage() {
  const router = useRouter();
  const [checks, setChecks] = React.useState<DeviceCheck[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    suitability: '',
    ownership: '',
  });
  const [groupByEmployee, setGroupByEmployee] = useState(false);

  React.useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const response = await getDeviceChecks({ limit: 100 });
      if (response.success && response.data) {
        setChecks(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch device checks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device check?')) {
      return;
    }

    try {
      const { deleteDeviceCheck } = await import('@/lib/services/device-checks.service');
      await deleteDeviceCheck(id);
      toast.success('Device check deleted successfully');
      fetchChecks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete device check');
    }
  };

  const handleDownloadPDF = async (check: DeviceCheck) => {
    try {
      toast.loading('Generating PDF...');
      await generateDeviceCheckPDF(check);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    }
  };

  const getSuitabilityBadge = (suitability: string) => {
    const variants: any = {
      'Suitable': 'success',
      'Limited Suitability': 'warning',
      'Needs Repair': 'destructive',
      'Unsuitable': 'destructive',
    };
    return <Badge variant={variants[suitability] || 'default'}>{suitability}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter checks
  const filteredChecks = checks.filter((check) => {
    const matchesSearch = 
      check.employeeSnapshot.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.deviceDetail.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.deviceDetail.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSuitability = !filters.suitability || check.deviceCondition.deviceSuitability === filters.suitability;
    const matchesOwnership = !filters.ownership || check.deviceDetail.ownership === filters.ownership;

    return matchesSearch && matchesSuitability && matchesOwnership;
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
      <div className="container py-8">
        <div className="text-center">Loading device checks...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Device Check Data</h1>
        <p className="text-muted-foreground">
          View and manage all device checking records
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, device brand or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filters.suitability}
              onChange={(e) => setFilters({ ...filters, suitability: e.target.value })}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All Conditions</option>
              <option value="Suitable">Suitable</option>
              <option value="Limited Suitability">Limited Suitability</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Unsuitable">Unsuitable</option>
            </select>
            <select
              value={filters.ownership}
              onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All Ownership</option>
              <option value="Company">Company</option>
              <option value="Personal">Personal</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ suitability: '', ownership: '' });
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="groupBy"
              checked={groupByEmployee}
              onChange={(e) => setGroupByEmployee(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="groupBy" className="text-sm cursor-pointer">
              Group by Employee
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredChecks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No device checks found</p>
          </CardContent>
        </Card>
      ) : groupByEmployee ? (
        // Grouped View
        <div className="space-y-6">
          {groupedChecks.map(({ employeeId, checks: employeeChecks }) => {
            const employee = employeeChecks[0].employeeSnapshot;
            return (
              <Card key={employeeId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {employee.fullName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {employee.position}
                        {employee.department && ` • ${employee.department}`}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        Total: {employeeChecks.length} checks
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/data-pengecekan/${employeeId}`}>
                        View All History
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employeeChecks.slice(0, 3).map((check) => (
                      <CheckCard
                        key={check._id}
                        check={check}
                        onEdit={() => router.push(`/form/edit/${check._id}`)}
                        onDelete={() => handleDelete(check._id)}
                        onDownload={() => handleDownloadPDF(check)}
                        compact
                      />
                    ))}
                    {employeeChecks.length > 3 && (
                      <Button variant="link" asChild className="w-full">
                        <Link href={`/data-pengecekan/${employeeId}`}>
                          View all {employeeChecks.length} checks →
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Card Grid View
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecks.map((check) => (
            <CheckCard
              key={check._id}
              check={check}
              onEdit={() => router.push(`/form/edit/${check._id}`)}
              onDelete={() => handleDelete(check._id)}
              onDownload={() => handleDownloadPDF(check)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CheckCard({ 
  check, 
  onEdit, 
  onDelete,
  onDownload,
  compact = false 
}: { 
  check: DeviceCheck; 
  onEdit: () => void; 
  onDelete: () => void;
  onDownload?: () => void;
  compact?: boolean;
}) {
  const getSuitabilityBadge = (suitability: string) => {
    const variants: any = {
      'Suitable': 'success',
      'Limited Suitability': 'warning',
      'Needs Repair': 'destructive',
      'Unsuitable': 'destructive',
    };
    return <Badge variant={variants[suitability] || 'default'}>{suitability}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Laptop className="h-5 w-5 text-primary" />
              {check.deviceDetail.deviceType}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {check.deviceDetail.deviceBrand} - {check.deviceDetail.deviceModel}
            </p>
          </div>
          <Badge variant="outline">v{check.version}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!compact && (
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{check.employeeSnapshot.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{check.employeeSnapshot.position}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(check.checkDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span>{check.deviceDetail.ownership}</span>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          {getSuitabilityBadge(check.deviceCondition.deviceSuitability)}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/data-pengecekan/${check.employeeId?.toString() || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {onDownload && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
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