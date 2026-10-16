// Returns page numbers to show, e.g. [1, '…', 4, 5, 6, '…', 12]
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, total, limit, onChange }) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">Showing {from}–{to} of {total}</span>
      <div className="pages">
        <button className="ghost sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        {pageList(page, pages).map((n, i) =>
          n === '…' ? <span key={`gap${i}`} className="gap">…</span> : (
            <button key={n} className={`ghost sm ${n === page ? 'current' : ''}`}
              aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>
          ))}
        <button className="ghost sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
