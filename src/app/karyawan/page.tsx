'use client';

import * as React from 'react';
import { getEmployees, type Employee } from '@/lib/services/employees.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User, UserPlus, Edit, Trash2, History, PlusCircle, Search, Upload, Download, FileSpreadsheet, AlertTriangle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
  }, []);

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

      toast.success('Template downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download template');
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
      toast.error('Please select a file to import');
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
        throw new Error(result.error || 'Import failed');
      }

      setImportResults(result.results);
      toast.success(
        `Imported ${result.results.imported} employees successfully. ${result.results.failed} failed.`
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
      toast.error(error.message || 'Failed to import employees');
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
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

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
    <div className="space-y-6 m-3">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('employee.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('employee.description')}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onEdit={() => router.push(`/karyawan/${employee._id}/edit`)}
              onDelete={() => handleDeleteClick(employee._id, employee.totalDeviceChecks)}
            />
          ))}
        </div>
      )}

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={handleCloseImportModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Employees from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with employee data. Only columns "Nama Lengkap" and "Bagian" are required.
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
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Required columns:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Nama Lengkap</strong> - Full name (auto-splits to first/last name)</li>
                    <li><strong>Bagian</strong> - Position/Job title</li>
                  </ul>
                  <p className="font-medium mt-3 mb-2">Optional columns:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Departemen/Divisi</strong> - Department</li>
                    <li><strong>Nomor Induk Karyawan</strong> - Employee ID (auto-generated if empty)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{importResults.imported}</p>
                    <p className="text-sm text-green-600">Imported</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{importResults.failed}</p>
                    <p className="text-sm text-red-600">Failed</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{importResults.total}</p>
                    <p className="text-sm text-blue-600">Total</p>
                  </div>
                </div>

                {importResults.failed > 0 && (
                  <div>
                    <p className="font-medium mb-2">Failed rows:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {importResults.failedData.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg text-sm">
                          <p className="font-medium text-red-700">Row {item.row}: {item.error}</p>
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
                    <p className="font-medium mb-2">Successfully imported:</p>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {importResults.successData.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-green-50 rounded-lg text-sm">
                          <p className="font-medium text-green-700">
                            Row {item.row}: {item.name} ({item.employeeId})
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
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseImportModal}>
                Close
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
    return <Badge variant={variants[status] || 'default'}>{t(`createEmployee.statusOptions.${status.toLowerCase()}`)}</Badge>;
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
              <CardTitle className="text-base sm:text-lg">{employee.fullName}</CardTitle>
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
        <div className="space-y-3 mb-4">
          {employee.department && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">{t('employee.department')}:</span>
              <span className="font-medium">{employee.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('employee.totalChecks')}:</span>
            <span className="font-medium">{employee.totalDeviceChecks}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('employee.lastCheck')}:</span>
            <span className="font-medium">
              {formatDate(employee.lastCheckDate)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" asChild>
                <Link href={`/data-pengecekan/${employee._id}`}>
                  <History className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.viewHistory')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-[40px]" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.editEmployee')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1 min-w-[40px]" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.tooltips.deleteEmployee')}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
