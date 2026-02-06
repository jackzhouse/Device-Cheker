'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Laptop, Database, Users, Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const navItems = [
    { href: '/form', label: t('header.form'), icon: Laptop },
    { href: '/data-pengecekan', label: t('header.checkData'), icon: Database },
    { href: '/karyawan', label: t('header.employeeData'), icon: Users },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo-tki.png"
              alt="TKI Logo"
              className="h-10 w-auto"
            />
            <span className="hidden font-bold sm:inline-block">
              Device Checking System
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          {/* Language Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title={t('header.toggleLanguage')}
          >
            <Globe className="h-5 w-5" />
            <span className="absolute top-1 right-1 text-[10px] font-bold">
              {language === 'en' ? 'EN' : 'ID'}
            </span>
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={t('header.toggleTheme')}
          >
            {theme === 'dark' ? (
              <Moon key="moon" className="h-5 w-5 animate-theme-toggle" />
            ) : (
              <Sun key="sun" className="h-5 w-5 animate-theme-toggle" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t md:hidden">
          <div className="container space-y-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Moon key="moon" className="mr-2 h-4 w-4 animate-theme-toggle" />
              ) : (
                <Sun key="sun" className="mr-2 h-4 w-4 animate-theme-toggle" />
              )}
              <span>{t('header.toggleTheme')}</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start relative"
              onClick={toggleLanguage}
            >
              <Globe className="mr-2 h-4 w-4" />
              <span>{t('header.toggleLanguage')}</span>
              <span className="ml-auto text-xs font-bold">
                {language === 'en' ? 'EN' : 'ID'}
              </span>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
