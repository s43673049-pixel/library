function statusClass(status) {
  const s = status.toLowerCase();
  if (s.includes("available")) return "badge badge--success";
  if (s.includes("checked")) return "badge badge--info";
  if (s.includes("overdue")) return "badge badge--warning";
  return "badge badge--info";
}

function getDerivedStatus(book) {
  const qty = Number(book.quantity) || 0;
  const available = Number(book.available) || 0;
  const borrowed = Math.max(0, qty - available);

  if (qty === 0) return "Unavailable";
  if (borrowed > 0 && available > 0) return "Partially checked out";
  if (borrowed > 0 && available === 0) return "Checked out";
  return "Available";
}

export default function ActivityTable({ books, loading }) {
  const derived = (books || []).slice(0, 5).map((b) => ({
    member: b.author || "—",
    book: b.title || "—",
    status: getDerivedStatus(b),
  }));

  return (
    <section className="card">
      <h2 className="dashboard-panel__title">Catalog snapshot</h2>

      {loading ? (
        <div className="status" role="status">
          <span className="spinner" aria-hidden /> Loading...
        </div>
      ) : derived.length === 0 ? (
        <div className="empty-state" style={{ padding: "1.5rem" }}>
          No books yet.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {derived.map((item, i) => (
                <tr key={`${item.book}-${i}`}>
                  <td>{item.member}</td>
                  <td>{item.book}</td>
                  <td>
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
