'use client';

import * as React from 'react';
import { getEmployees, type Employee } from '@/lib/services/employees.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User, UserPlus, Edit, Trash2, History, PlusCircle, Search
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EmployeesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees({ limit: 100 });
      if (response.success && response.data) {
        setEmployees(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, totalChecks: number) => {
    const confirmMsg = totalChecks > 0 
      ? 'This employee has device checks. Deleting will mark them as resigned. Continue?'
      : t('employee.confirmDelete');
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const { deleteEmployee } = await import('@/lib/services/employees.service');
      await deleteEmployee(id);
      toast.success(t('employee.toast.deleteSuccess'));
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.message || t('employee.toast.deleteFailed'));
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique departments
  const departments = React.useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [employees]);

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !filterDept || employee.department === filterDept;
    const matchesStatus = !filterStatus || employee.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('employee.title')}</h1>
            <p className="text-muted-foreground">
              {t('employee.description')}
            </p>
          </div>
          <Button asChild>
            <Link href="/karyawan/new">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('employee.addButton')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('employee.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">{t('employee.filters.allDepartments')}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">{t('employee.filters.allPositions')}</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setFilterDept('');
                setFilterStatus('');
                setSearchTerm('');
              }}
            >
              {t('common.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('employee.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={() => router.push(`/karyawan/${employee._id}/edit`)}
              onDelete={() => handleDelete(employee._id, employee.totalDeviceChecks)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  
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
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{employee.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {employee.position}
              </p>
            </div>
          </div>
          {getStatusBadge(employee.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          {employee.department && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{employee.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('employee.totalChecks')}:</span>
            <span className="font-medium">{employee.totalDeviceChecks}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Last Check:</span>
            <span className="font-medium">
              {formatDate(employee.lastCheckDate)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/data-pengecekan/${employee._id}`}>
              <History className="h-4 w-4" />
            </Link>
          </Button>
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
