import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const titles = {
  "/": "Dashboard",
  "/books": "Books",
  "/add-book": "Add book",
  "/login": "Sign in",
  "/signup": "Create account",
  "/client-dashboard": "Client dashboard",
  "/members": "Members",
  "/transactions": "Transactions",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Library";
  const { token, user, logout } = useContext(AuthContext);

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">{title}</h1>
        <p className="topbar__subtitle">Library Management System</p>
      </div>
      <div className="topbar__actions">
        <button type="button" className="topbar__icon-btn" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="topbar__icon-btn" aria-label="Profile">
          👤
        </button>
        {token ? (
          <button type="button" className="topbar__icon-btn" onClick={logout} aria-label="Sign out">
            <i className="fi fi-rr-address-card"></i>
          </button>
        ) : (
          <Link to="/login" className="topbar__link">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
