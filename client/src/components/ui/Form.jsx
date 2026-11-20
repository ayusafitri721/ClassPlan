import { cloneElement, forwardRef } from 'react';

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`field ${className}`} {...props} />;
});

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={`field ${className}`} {...props}>
      {children}
    </select>
  );
});

export function TextField({
  name,
  label,
  error,
  hint,
  required = false,
  className = '',
  children,
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="font-normal text-muted"> (wajib)</span> : null}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label
      className={`flex min-h-9 cursor-pointer items-start gap-2.5 rounded px-2 py-1.5 hover:bg-canvas ${className}`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#1d4ed8]"
        {...props}
      />
      <span className="text-sm leading-5">{label}</span>
    </label>
  );
}
