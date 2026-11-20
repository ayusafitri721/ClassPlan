import { Spinner } from './Feedback.jsx';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS = {
  primary: 'border border-transparent bg-accent text-white hover:bg-[#1a43bd]',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas',
  ghost: 'border border-transparent text-muted hover:bg-canvas hover:text-ink',
  danger: 'border border-transparent bg-danger text-white hover:bg-[#991b1b]',
  dangerOutline: 'border border-[#e3b4b4] bg-surface text-danger hover:bg-danger-soft',
};

const SIZES = {
  sm: 'h-11 px-3 text-[13px] sm:h-9',
  md: 'h-11 px-4 text-sm sm:h-10',
  lg: 'h-12 px-5 text-sm',
};

export function buttonClass({ variant = 'secondary', size = 'md', className = '' } = {}) {
  return [BASE, VARIANTS[variant] ?? VARIANTS.secondary, SIZES[size] ?? SIZES.md, className]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
