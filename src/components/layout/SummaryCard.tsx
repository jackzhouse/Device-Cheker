import { Card, CardContent } from '@/components/ui/card';

export default function SummaryCard({
  title,
  value,
  meta,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="panel-card border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="data-label">{title}</div>
            <div className="type-number mt-1.5 text-[27px] font-semibold leading-none tracking-[-.025em] text-foreground">{value}</div>
            {meta ? <div className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{meta}</div> : null}
          </div>
          {icon ? <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
