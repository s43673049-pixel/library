// export default function StatCard({ title, value, icon: Icon }) {
//   return (
//     <article className="stat-card">
//       <p className="stat-card__label">{title}</p>
//       <p className="stat-card__value">{value}</p>
//       <div className="stat-card__icon" aria-hidden>
//         {Icon && <Icon />}
//       </div>
//     </article>
//   );
// }

export default function StatCard({
  title,
  value,
  icon: Icon,
  format,
  loading = false,
  className = "",
}) {
  const displayValue = loading
    ? "..."
    : format
    ? format(value)
    : value ?? "—";

  return (
    <article className={`stat-card ${className}`}>
      <p className="stat-card__label">{title}</p>

      <p className="stat-card__value">
        {displayValue}
      </p>

      {Icon && (
        <div className="stat-card__icon" aria-hidden="true">
          <Icon />
        </div>
      )}
    </article>
  );
}
  