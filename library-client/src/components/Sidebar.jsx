import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
 { to: "/books", label: "Books", icon: "📚" }, 
  { to: "/members", label: "Members", icon: "👥" },
  { to: "/transactions", label: "Transactions", icon: "🔄" },
  { to: "/client-dashboard", label: "Client dashboard", icon: "👤" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <NavLink to="/" className="sidebar__brand" end>
        <span className="sidebar__brand-icon" aria-hidden>
          📖
        </span>
        <span className="sidebar__brand-text">Library</span>
      </NavLink>

      <nav className="sidebar__nav" aria-label="Sections">
        <div className="sidebar__label">Menu</div>
        {items.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            <span className="sidebar__nav-icon" aria-hidden>
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">v1.0 · Local</div>
    </aside>
  );
}
