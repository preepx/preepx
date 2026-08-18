/**
 * components/SkeletonLoader.jsx — Loading skeleton for table rows and cards
 */
export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className={`skeleton h-4 rounded ${i === 0 ? 'w-3/4' : i === cols - 1 ? 'w-16' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton h-3 w-16 rounded mb-4" />
      <div className="skeleton h-8 w-24 rounded mb-2" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 4 }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="skeleton h-3 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
