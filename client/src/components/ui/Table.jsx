export function Table({ children, className = '', minWidth = 'min-w-[640px]' }) {
  return (
    <div className={`overflow-x-auto rounded-card border border-line bg-surface ${className}`}>
      <table className={`w-full border-collapse text-sm ${minWidth}`}>{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-line bg-canvas text-left text-[13px] font-medium text-muted">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({ children, className = '' }) {
  return <tr className={className}>{children}</tr>;
}

export function TH({ children, className = '' }) {
  return (
    <th scope="col" className={`px-4 py-3 font-medium ${className}`}>
      {children}
    </th>
  );
}

export function TD({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
