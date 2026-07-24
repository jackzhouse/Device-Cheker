export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-hero">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <div className="eyebrow mb-2">{eyebrow}</div>
        ) : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-desc mt-1.5">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end">{actions}</div> : null}
    </div>
  );
}
