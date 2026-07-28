'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

export type FormSectionNavItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  label?: string;
};

type FormSectionNavProps = {
  sections: readonly FormSectionNavItem[];
  activeSection: string;
  getSectionStatus?: (sectionId: string) => 'complete' | 'incomplete' | 'skipped';
  ariaLabel: string;
};

export default function FormSectionNav({ sections, activeSection, getSectionStatus, ariaLabel }: FormSectionNavProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { rootMargin: '-56px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const headerHeight = document.querySelector('.workspace-topbar')?.getBoundingClientRect().height ?? 56;
    const navHeight = document.querySelector('.form-anchor-bar')?.getBoundingClientRect().height ?? 0;
    const targetTop = window.scrollY + section.getBoundingClientRect().top - headerHeight - navHeight - 12;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  return (
    <>
      <div ref={sentinelRef} className="form-anchor-sentinel" aria-hidden="true" />
      <div className={`form-anchor-shell ${isSticky ? 'form-anchor-bar-stuck' : ''}`}>
        <nav className="form-anchor-bar" aria-label={ariaLabel}>
          {sections.map((section, index) => {
            const complete = getSectionStatus?.(section.id) === 'complete';
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`form-anchor-item ${active ? 'form-anchor-item-active' : ''} ${complete ? 'form-anchor-item-complete' : ''}`}
                aria-current={active ? 'location' : undefined}
              >
                <span className="form-anchor-index">{section.label ?? String(index + 1)}</span>
                <section.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate">{section.title}</span>
                <span className="ml-auto shrink-0" aria-label={complete ? 'Complete' : 'Incomplete'}>
                  {complete ? <Check className="h-3.5 w-3.5" /> : <span className="form-anchor-dot" />}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
