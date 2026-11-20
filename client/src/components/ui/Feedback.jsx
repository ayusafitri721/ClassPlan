import { Link } from 'react-router-dom';
import { buttonClass } from './Button.jsx';

export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

const BADGE_TONES = {
  neutral: 'bg-canvas text-muted border-line',
  accent: 'bg-accent-soft text-[#17306b] border-[#c8d8f7]',
  ok: 'bg-ok-soft text-[#14532d] border-[#c4e3d0]',
  warn: 'bg-warn-soft text-[#7c2d12] border-[#eed4b4]',
  danger: 'bg-danger-soft text-[#7f1d1d] border-[#efc2c2]',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[12px] font-medium ${BADGE_TONES[tone] ?? BADGE_TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`px-6 py-12 text-center ${className}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ error, title = 'Gagal memuat data', onRetry }) {
  const message =
    error?.message ?? 'Permintaan ke server tidak berhasil. Periksa koneksi lalu coba lagi.';

  return (
    <div className="rounded-card border border-[#efc2c2] bg-danger-soft px-5 py-4">
      <p className="text-sm font-semibold text-[#7f1d1d]">{title}</p>
      <p className="mt-1 text-sm text-[#7f1d1d]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-[#7f1d1d] underline underline-offset-2"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function Notice({ tone = 'info', title, children }) {
  const tones = {
    info: 'border-line bg-canvas text-ink',
    warn: 'border-[#eed4b4] bg-warn-soft text-[#7c2d12]',
    ok: 'border-[#c4e3d0] bg-ok-soft text-[#14532d]',
    danger: 'border-[#efc2c2] bg-danger-soft text-[#7f1d1d]',
  };

  return (
    <div className={`rounded-card border px-4 py-3 ${tones[tone] ?? tones.info}`}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className={`text-sm ${title ? 'mt-1' : ''}`}>{children}</div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <span className={`block rounded bg-[#e8ebf1] ${className}`} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface" aria-busy="true">
      <div className="border-b border-line bg-canvas px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-b border-line px-4 py-4 last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton key={columnIndex} className="h-3.5 w-full" />
          ))}
        </div>
      ))}
      <span className="sr-only">Memuat data</span>
    </div>
  );
}

export function PageLoading({ label = 'Memuat halaman' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function InlineLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-medium text-accent underline underline-offset-2 hover:text-[#1a43bd]"
    >
      {children}
    </Link>
  );
}

export { buttonClass };
