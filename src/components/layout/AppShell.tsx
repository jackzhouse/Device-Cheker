'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookOpen, ClipboardList, Database, Laptop, LogOut, Menu, Moon, Shield, Sun, Users, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3, permission: 'dashboard.view' },
  { href: '/form', label: 'Input Check', icon: Laptop, permission: 'checks.create' },
  { href: '/data-pengecekan', label: 'Data Pengecekan', icon: Database, permission: 'checks.view' },
  { href: '/laporan-terakhir', label: 'Laporan Terakhir', icon: ClipboardList, permission: 'reports.view' },
  { href: '/karyawan', label: 'Data Karyawan', icon: Users, permission: 'employees.view' },
  { href: '/users-roles', label: 'User & Roles', icon: Shield, permission: 'users.manage' },
  { href: '/dokumentasi', label: 'Dokumentasi', icon: BookOpen, permission: 'docs.view' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const items = useMemo(() => {
    const permissions = user?.permissions || [];
    return navItems.filter((item) => permissions.includes(item.permission as any));
  }, [user?.permissions]);

  if (!mounted) return null;
  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <div className="workspace-topbar-inner">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="text-[var(--chrome-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)] lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link href="/dashboard" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--chrome-active)] text-[var(--chrome-bg)]">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="hidden min-w-0 sm:block">
                <div className="truncate text-[13px] font-semibold leading-none tracking-[-.02em] text-[var(--chrome-text)]">Device Checking</div>
                <div className="mt-1 flex items-center gap-1.5 truncate text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--chrome-muted)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--chrome-active)]" /> Operations</div>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`workspace-nav-item ${active ? 'workspace-nav-item-active' : ''}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[var(--chrome-muted)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)]" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="text-[var(--chrome-muted)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)]" onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}>
              {language === 'en' ? 'EN' : 'ID'}
            </Button>
            {user && (
              <div className="hidden border-l border-[var(--app-border-strong)] pl-3 text-right md:block">
                <div className="max-w-36 truncate text-xs font-bold leading-none text-[var(--chrome-text)]">{user.name}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--chrome-active)]">{user.role}</div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout} disabled={loading} className="hidden border-[var(--app-border-strong)] bg-transparent text-[var(--chrome-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)] sm:inline-flex">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--app-border-strong)] bg-[var(--chrome-bg)] px-4 py-4 shadow-lg lg:hidden">
            <div className="grid gap-2">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${active ? 'bg-[var(--chrome-active)] text-[var(--foreground)]' : 'text-[var(--chrome-muted)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)]'}`}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Button variant="outline" className="mt-2 justify-start border-[var(--app-border-strong)] bg-transparent text-[var(--chrome-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-text)]" onClick={logout} disabled={loading}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="workspace-main">{children}</main>
    </div>
  );
}
