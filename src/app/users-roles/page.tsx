'use client';

import * as React from 'react';
import { Eye, Save, Shield, Search, RefreshCw, Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/layout/FilterBar';
import TableSurface from '@/components/layout/TableSurface';
import SummaryCard from '@/components/layout/SummaryCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AppUserRole,
  getManagedUsers,
  ManagedAppUser,
  getUserSyncJob,
  syncManagedUsers,
  updateManagedUser,
  updateManagedUserRole,
  UserSyncJob,
  UserSyncSummary,
} from '@/lib/services/users-roles.service';
import { getKatalisAccessToken } from '@/lib/auth/browser-token';
import { useLanguage } from '@/contexts/LanguageContext';

const roleOptions: AppUserRole[] = ['admin', 'pic', 'viewer'];

export default function UsersRolesPage() {
  const { language } = useLanguage();
  const copy = language === 'id' ? {
    sync: 'Sinkronkan pengguna', refresh: 'Muat ulang', users: 'Pengguna tersinkron', active: 'Pengguna aktif', admins: 'Admin', access: 'Akses Device Checking',
    search: 'Cari nama, nomor karyawan, email, departemen...', allRoles: 'Semua role', allDepartments: 'Semua departemen', allStatus: 'Semua status', reset: 'Reset',
    activeStatus: 'Aktif', inactiveStatus: 'Nonaktif / Resign', detail: 'Detail', deactivate: 'Nonaktifkan', activate: 'Aktifkan', accessAction: 'Akses', lastSync: 'Sinkron terakhir', actions: 'Aksi',
    loading: 'Memuat pengguna...', empty: 'Belum ada pengguna tersinkron.', retry: 'Coba lagi', syncTitle: 'Sinkronkan data pengguna dari Attendance', close: 'Tutup', runSync: 'Mulai sinkronisasi', syncing: 'Menyinkronkan...',
    roleGuide: 'Panduan role', roleAdmin: 'Admin: kelola user, role, dan data.', rolePic: 'PIC: kelola pengecekan perangkat.', roleViewer: 'Viewer: lihat data tanpa mengubah.', progress: 'Progress sinkronisasi', updated: 'Diperbarui',
  } : {
    sync: 'Sync users', refresh: 'Refresh', users: 'Synced users', active: 'Active users', admins: 'Admins', access: 'Device Checking access',
    search: 'Search name, employee no, email, department...', allRoles: 'All roles', allDepartments: 'All departments', allStatus: 'All status', reset: 'Reset',
    activeStatus: 'Active', inactiveStatus: 'Inactive / Resigned', detail: 'Detail', deactivate: 'Deactivate', activate: 'Activate', accessAction: 'Access', lastSync: 'Last Sync', actions: 'Actions',
    loading: 'Loading users...', empty: 'No synced users yet.', retry: 'Try again', syncTitle: 'Sync user data from Attendance', close: 'Close', runSync: 'Start sync', syncing: 'Syncing...',
    roleGuide: 'Role guide', roleAdmin: 'Admin: manage users, roles, and data.', rolePic: 'PIC: manage device checks.', roleViewer: 'Viewer: view data without changes.', progress: 'Sync progress', updated: 'Updated',
  };
  const [users, setUsers] = React.useState<ManagedAppUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingUserId, setSavingUserId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('');
  const [filterDepartment, setFilterDepartment] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [pendingChange, setPendingChange] = React.useState<{ user: ManagedAppUser; role: AppUserRole } | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<ManagedAppUser | null>(null);
  const [editDraft, setEditDraft] = React.useState<Partial<ManagedAppUser>>({});
  const [syncDialogOpen, setSyncDialogOpen] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [syncJob, setSyncJob] = React.useState<UserSyncJob | null>(null);
  const [syncSummary, setSyncSummary] = React.useState<UserSyncSummary | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getManagedUsers({ limit: 200 });
      setUsers(response.data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    if (!syncJob || !['queued', 'running'].includes(syncJob.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await getUserSyncJob(syncJob.id);
        const job = response.data;
        if (!job) return;
        setSyncJob(job);
        setSyncSummary(job.summary);
        if (job.status === 'completed') {
          toast.success(`Sync selesai: ${job.summary.created} created, ${job.summary.updated} updated, ${job.summary.skipped} skipped`);
          setSyncing(false);
          await fetchUsers();
        }
        if (job.status === 'failed') {
          toast.error(job.error || 'Sync failed');
          setSyncing(false);
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to fetch sync progress');
        setSyncing(false);
      }
    }, 1200);

    return () => window.clearInterval(timer);
  }, [fetchUsers, syncJob]);

  const departments = React.useMemo(() => {
    const values = new Set(users.map((user) => user.departmentName).filter(Boolean));
    return Array.from(values).sort();
  }, [users]);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.employeeNo || '').toLowerCase().includes(search) ||
      (user.departmentName || '').toLowerCase().includes(search) ||
      (user.jobTitle || '').toLowerCase().includes(search);
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesDepartment = !filterDepartment || user.departmentName === filterDepartment;
    const matchesStatus = !filterStatus || (filterStatus === 'active' ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const activeCount = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const accessCount = users.filter((user) => (user.accessScopes || []).includes('devicechecking')).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role: AppUserRole) => {
    const variants: Record<AppUserRole, 'destructive' | 'default' | 'secondary'> = {
      admin: 'destructive',
      pic: 'default',
      viewer: 'secondary',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const handleRoleSelection = (user: ManagedAppUser, role: AppUserRole) => {
    if (user.role === role) return;
    if (user.role === 'admin' || role === 'admin') {
      setPendingChange({ user, role });
      return;
    }
    updateRole(user, role);
  };

  const openUserDetail = (user: ManagedAppUser) => {
    setSelectedUser(user);
    setEditDraft({
      name: user.name,
      email: user.email,
      departmentName: user.departmentName,
      jobTitle: user.jobTitle,
      isActive: user.isActive,
      role: user.role,
      accessScopes: user.accessScopes || [],
    });
  };

  const updateRole = async (user: ManagedAppUser, role: AppUserRole) => {
    setSavingUserId(user._id);
    try {
      await updateManagedUserRole(user._id, role);
      toast.success(`${user.name}: ${role}`);
      await fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setSavingUserId(null);
      setPendingChange(null);
    }
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSavingUserId(selectedUser._id);
    try {
      await updateManagedUser(selectedUser._id, editDraft);
      toast.success(language === 'id' ? 'User berhasil diperbarui' : 'User updated');
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setSavingUserId(null);
    }
  };

  const toggleUserActive = async (user: ManagedAppUser) => {
    setSavingUserId(user._id);
    try {
      await updateManagedUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? (language === 'id' ? 'User dinonaktifkan' : 'User deactivated') : (language === 'id' ? 'User diaktifkan' : 'User activated'));
      await fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setSavingUserId(null);
    }
  };

  const toggleDeviceCheckingAccess = async (user: ManagedAppUser) => {
    const scopes = new Set(user.accessScopes || []);
    if (scopes.has('devicechecking')) {
      scopes.delete('devicechecking');
    } else {
      scopes.add('devicechecking');
    }

    setSavingUserId(user._id);
    try {
      await updateManagedUser(user._id, { accessScopes: Array.from(scopes) });
      toast.success(language === 'id' ? 'Akses diperbarui' : 'Access updated');
      await fetchUsers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update access');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleSyncUsers = async () => {
    const credentialToken = getKatalisAccessToken();
    if (!credentialToken) {
      toast.error('Token login tidak tersedia. Silakan login ulang.');
      return;
    }

    setSyncing(true);
    setSyncSummary(null);
    setSyncJob(null);
    try {
      const response = await syncManagedUsers(credentialToken);
      const job = response.data;
      if (!job) throw new Error('Sync job tidak dibuat');
      setSyncJob(job);
      setSyncSummary(job.summary);
      toast.success(language === 'id' ? 'Sinkronisasi dimulai' : 'Sync job started');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync users');
      setSyncing(false);
    }
  };

  const syncProgress = syncJob?.status === 'completed'
    ? 100
    : syncJob?.totalPages
      ? Math.min(99, Math.round(((syncJob.page + 1) / syncJob.totalPages) * 100))
      : syncJob
        ? 12
        : 0;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="RBAC"
        title="Pengelolaan User"
        description={language === 'id' ? 'Kelola akun login, status, role, dan akses pengecekan perangkat.' : 'Manage login accounts, status, roles, and device-checking access.'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSyncDialogOpen(true)} disabled={syncing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {copy.sync}
            </Button>
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {copy.refresh}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard title={copy.users} value={users.length} icon={<Users className="h-5 w-5" />} meta={language === 'id' ? 'Data AppUser' : 'AppUser records'} />
        <SummaryCard title={copy.active} value={activeCount} icon={<UserCheck className="h-5 w-5" />} meta={language === 'id' ? 'Dapat login' : 'Can log in'} />
        <SummaryCard title={copy.admins} value={adminCount} icon={<Shield className="h-5 w-5" />} meta={language === 'id' ? 'Kelola role' : 'Manage roles'} />
        <SummaryCard title={copy.access} value={accessCount} icon={<Shield className="h-5 w-5" />} meta={language === 'id' ? 'Akses diberikan' : 'Access granted'} />
      </div>

      <FilterBar>
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_160px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={copy.search}
              className="pl-9"
            />
          </div>
          <select className="filter-control w-full" value={filterRole} onChange={(event) => setFilterRole(event.target.value)}>
            <option value="">{copy.allRoles}</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select className="filter-control w-full" value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}>
            <option value="">{copy.allDepartments}</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
          <select className="filter-control w-full" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="">{copy.allStatus}</option>
            <option value="active">{copy.activeStatus}</option>
            <option value="inactive">{copy.inactiveStatus}</option>
          </select>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterRole(''); setFilterDepartment(''); setFilterStatus(''); }}>
            {copy.reset}
          </Button>
        </div>
      </FilterBar>

      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-subtle)] p-3 text-xs text-muted-foreground">
        <div className="mb-2 font-semibold text-foreground">{copy.roleGuide}</div>
        <div className="grid gap-2 md:grid-cols-3"><span><Badge variant="destructive">admin</Badge> {copy.roleAdmin}</span><span><Badge variant="default">pic</Badge> {copy.rolePic}</span><span><Badge variant="secondary">viewer</Badge> {copy.roleViewer}</span></div>
      </div>

      <TableSurface>
        {loading ? (
          <div className="space-y-3 p-4" aria-label={copy.loading}><div className="h-8 animate-pulse rounded bg-muted" /><div className="h-8 animate-pulse rounded bg-muted" /><div className="h-8 animate-pulse rounded bg-muted" /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center" role="alert"><p className="text-sm text-muted-foreground">{error}</p><Button onClick={fetchUsers}>{copy.retry}</Button></div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state m-4">
            <UserX className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{copy.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--app-border)] bg-[var(--app-subtle)] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">User</th>
                  <th className="px-3 py-2.5 font-medium">Employee No</th>
                  <th className="px-3 py-2.5 font-medium">Department / Job</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Access</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">{copy.lastSync}</th>
                  <th className="px-3 py-2.5 font-medium">{copy.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[var(--app-subtle)]/60">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email || user.externalUserId}</div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{user.employeeNo || '-'}</td>
                    <td className="px-3 py-2.5">
                      <div>{user.departmentName || '-'}</div>
                      <div className="text-xs text-muted-foreground">{user.jobTitle || '-'}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={user.isActive ? 'success' : 'secondary'}>{user.isActive ? copy.activeStatus : (language === 'id' ? 'Nonaktif' : 'Inactive')}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={(user.accessScopes || []).includes('devicechecking') ? 'default' : 'secondary'}>
                        {(user.accessScopes || []).includes('devicechecking') ? (language === 'id' ? 'Perangkat' : 'Device checks') : (language === 'id' ? 'Tidak ada' : 'None')}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">{getRoleBadge(user.role)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(user.lastSyncedAt)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openUserDetail(user)}>
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          {copy.detail}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleUserActive(user)} disabled={savingUserId === user._id}>
                          {user.isActive ? copy.deactivate : copy.activate}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleDeviceCheckingAccess(user)} disabled={savingUserId === user._id}>
                          {copy.accessAction}
                        </Button>
                        <select
                          className="filter-control h-9 w-28"
                          value={user.role}
                          disabled={savingUserId === user._id}
                          onChange={(event) => handleRoleSelection(user, event.target.value as AppUserRole)}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableSurface>

      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.syncTitle}</DialogTitle>
            <DialogDescription>
              {language === 'id' ? 'Data pengguna akan diperbarui dari Attendance. Role dan akses yang sudah ada tetap dipertahankan.' : 'User data will be updated from Attendance. Existing roles and access remain unchanged.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {syncSummary && (
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-subtle)] p-3 text-sm text-muted-foreground">
                {language === 'id'
                  ? `Ditambahkan: ${syncSummary.created} · Diperbarui: ${syncSummary.updated} · Dilewati: ${syncSummary.skipped} · Gagal: ${syncSummary.failed}`
                  : `Added: ${syncSummary.created} · Updated: ${syncSummary.updated} · Skipped: ${syncSummary.skipped} · Failed: ${syncSummary.failed}`}
                <div className="mt-3"><div className="mb-1 flex justify-between text-[11px]"><span>{copy.progress}</span><span>{syncProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${syncProgress}%` }} /></div>{syncJob?.updatedAt && <div className="mt-1 text-[11px]">{copy.updated}: {formatDate(syncJob.updatedAt)}</div>}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>{copy.close}</Button>
            <Button onClick={handleSyncUsers} disabled={syncing}>
              {syncing ? copy.syncing : syncJob?.status === 'failed' ? copy.retry : copy.runSync}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User detail</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.externalUserId} · ${selectedUser.employeeNo || '-'}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input value={editDraft.name || ''} onChange={(event) => setEditDraft((draft) => ({ ...draft, name: event.target.value }))} placeholder="Name" />
            <Input value={editDraft.email || ''} onChange={(event) => setEditDraft((draft) => ({ ...draft, email: event.target.value }))} placeholder="Email" />
            <Input value={editDraft.departmentName || ''} onChange={(event) => setEditDraft((draft) => ({ ...draft, departmentName: event.target.value }))} placeholder="Department" />
            <Input value={editDraft.jobTitle || ''} onChange={(event) => setEditDraft((draft) => ({ ...draft, jobTitle: event.target.value }))} placeholder="Job title" />
            <select className="filter-control" value={editDraft.role || 'viewer'} onChange={(event) => setEditDraft((draft) => ({ ...draft, role: event.target.value as AppUserRole }))}>
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(editDraft.isActive)} onChange={(event) => setEditDraft((draft) => ({ ...draft, isActive: event.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(editDraft.accessScopes || []).includes('devicechecking')}
                onChange={(event) => setEditDraft((draft) => {
                  const scopes = new Set(draft.accessScopes || []);
                  if (event.target.checked) scopes.add('devicechecking');
                  else scopes.delete('devicechecking');
                  return { ...draft, accessScopes: Array.from(scopes) };
                })}
              />
              devicechecking access
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
            <Button onClick={saveUser} disabled={!selectedUser || savingUserId === selectedUser._id}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingChange)} onOpenChange={(open) => !open && setPendingChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm role change</DialogTitle>
            <DialogDescription>
              {pendingChange
                ? `Change ${pendingChange.user.name} from ${pendingChange.user.role} to ${pendingChange.role}? This changes the configured AppUser role.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingChange(null)}>Cancel</Button>
            <Button
              onClick={() => pendingChange && updateRole(pendingChange.user, pendingChange.role)}
              disabled={!pendingChange || savingUserId === pendingChange.user._id}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
