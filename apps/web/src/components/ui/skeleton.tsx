'use client'

export function Skeleton({ width, height, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || 16,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-subtle)',
      animation: 'pulse 1.5s infinite',
      ...style,
    }} />
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}><Skeleton width={80} height={10} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c}><Skeleton width={c === 0 ? 140 : 80} height={12} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
