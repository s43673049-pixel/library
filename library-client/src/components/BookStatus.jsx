export default function BookStatus({ books, loading }) {
  let availableCopies = 0;
  let borrowedCopies = 0;

  for (const b of books || []) {
    const qty = Number(b.quantity) || 0;
    const available = Number(b.available) || 0;
    availableCopies += available;
    borrowedCopies += Math.max(0, qty - available);
  }

  const rows = [
    { label: "Borrowed", value: borrowedCopies.toLocaleString() },
    { label: "Overdue", value: "—" },
    { label: "Reserved", value: "—" },
    { label: "Available", value: availableCopies.toLocaleString() },
  ];

  return (
    <section className="card">
      <h2 className="dashboard-panel__title">Book status</h2>

      {loading ? (
        <div className="status" role="status">
          <span className="spinner" aria-hidden /> Loading...
        </div>
      ) : (
        <ul className="book-status-list">
          {rows.map(({ label, value }) => (
            <li key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
