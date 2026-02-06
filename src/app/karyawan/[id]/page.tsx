'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEmployeeById, type Employee } from '@/lib/services/employees.service';
import { getEmployeeChecks } from '@/lib/services/device-checks.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Building, Mail, Phone, Edit, Trash2, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteEmployee } from '@/lib/services/employees.service';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const [employee, setEmployee] = React.useState<any>(null);
  const [checks, setChecks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ensure employeeId is a string
      const idStr = String(employeeId);
      
      // Fetch employee details
      const empResponse = await getEmployeeById(idStr);
      if (empResponse.success && empResponse.data) {
        setEmployee(empResponse.data);
      }

      // Fetch employee checks
      const checksResponse = await getEmployeeChecks(idStr);
      if (checksResponse.success && checksResponse.data) {
        setChecks(checksResponse.data.checks || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This will also affect all associated device checks.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteEmployee(employeeId);
      if (response.success) {
        toast.success('Employee deleted successfully');
        router.push('/karyawan');
      } else {
        toast.error('Failed to delete employee');
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
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
        <div className="text-center">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Employee not found</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Employees
      </Button>

      {/* Employee Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{employee.fullName}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building className="h-4 w-4" />
                  <span>{employee.position}</span>
                  {employee.department && (
                    <>
                      <span>•</span>
                      <span>{employee.department}</span>
                    </>
                  )}
                </div>
                <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/form?employeeId=${employeeId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Check
              </Button>
              <Button variant="outline" onClick={() => router.push(`/data-pengecekan/${employeeId}`)}>
                <Calendar className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">First Name</label>
              <p className="font-medium">{employee.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <p className="font-medium">{employee.lastName}</p>
            </div>
            {employee.email && (
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </p>
              </div>
            )}
            {employee.phoneNumber && (
              <div>
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {employee.phoneNumber}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Position</label>
              <p className="font-medium">{employee.position}</p>
            </div>
            {employee.department && (
              <div>
                <label className="text-sm text-muted-foreground">Department</label>
                <p className="font-medium">{employee.department}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'} className="mt-1">
                {employee.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Total Device Checks</label>
              <p className="font-medium text-2xl">{employee.totalDeviceChecks || 0}</p>
            </div>
            {employee.lastCheckDate && (
              <div>
                <label className="text-sm text-muted-foreground">Last Check Date</label>
                <p className="font-medium">{formatDate(employee.lastCheckDate)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Device Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Device Checks</CardTitle>
            {checks.length > 3 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/data-pengecekan/${employeeId}`}>
                  View All ({checks.length})
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No device checks found for this employee
            </p>
          ) : (
            <div className="space-y-4">
              {checks.slice(0, 3).map((check) => (
                <div
                  key={check._id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">v{check.version}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(check.checkDate)}
                        </span>
                      </div>
                      <h3 className="font-semibold">
                        {check.deviceDetail.deviceType}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {check.deviceDetail.deviceBrand} - {check.deviceDetail.deviceModel}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/form/edit/${check._id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Serial:</span>{' '}
                      {check.deviceDetail.serialNumber}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suitability:</span>{' '}
                      <Badge
                        variant={
                          check.deviceCondition.deviceSuitability === 'Suitable'
                            ? 'success'
                            : 'destructive'
                        }
                        className="ml-2"
                      >
                        {check.deviceCondition.deviceSuitability}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/karyawan/${employeeId}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? 'Deleting...' : 'Delete Employee'}
        </Button>
      </div>
    </div>
  );
}