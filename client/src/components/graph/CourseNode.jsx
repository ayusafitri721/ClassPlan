import { Handle, Position } from '@xyflow/react';

export function CourseNode({ data, selected }) {
  const { code, name, degree, color, tint, line, active } = data;
  const colored = Boolean(color);

  return (
    <div
      className={[
        'w-[168px] rounded-md border bg-surface px-3 py-2 text-left transition-shadow',
        selected ? 'border-accent shadow-[0_0_0_2px_rgba(29,78,216,0.25)]' : 'border-line',
        active ? 'shadow-[0_0_0_3px_rgba(29,78,216,0.35)]' : '',
      ].join(' ')}
      style={
        colored
          ? { borderLeft: `3px solid ${line}`, backgroundColor: tint }
          : { borderLeft: '3px solid #94a3b8' }
      }
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="!opacity-0" />
      <p className="font-mono text-[12px] font-medium text-ink">{code}</p>
      <p className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-muted">{name}</p>
      <p className="mt-1 text-[11px] text-muted">
        Derajat <span className="tabular font-medium text-ink">{degree}</span>
        {colored ? (
          <span className="ml-2">
            Warna <span className="tabular font-medium text-ink">{color}</span>
          </span>
        ) : null}
      </p>
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="!opacity-0" />
    </div>
  );
}
