import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/Mainlayout";
import { getBooks, getMembers, getTransactions } from "../services/api";

export default function ClientDashboard() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookQuery, setBookQuery] = useState("");
  const [txFilter, setTxFilter] = useState("all");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setError("");
        setLoading(true);
        const [booksRes, membersRes, txRes] = await Promise.all([
          getBooks(),
          getMembers(),
          getTransactions(false),
        ]);
        if (!mounted) return;
        setBooks(booksRes.data || []);
        setMembers(membersRes.data || []);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    let totalCopies = 0;
    let availableCopies = 0;
    for (const b of books) {
      const qty = Number(b.quantity) || 0;
      const avail = Number(b.available) || 0;
      totalCopies += qty;
      availableCopies += avail;
    }

    const issuedCount = transactions.filter((t) => t.status === "issued").length;
    const overdueCount = transactions.filter((t) => t.status === "overdue").length;

    return {
      totalTitles: books.length,
      totalMembers: members.length,
      issuedCount,
      overdueCount,
      totalCopies,
      availableCopies,
    };
  }, [books, members, transactions]);

  const filteredBooks = useMemo(() => {
    const q = bookQuery.trim().toLowerCase();
    if (!q) return books.slice(0, 12);
    return books
      .filter((b) => `${b.title ?? ""} ${b.author ?? ""}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [books, bookQuery]);

  const filteredTransactions = useMemo(() => {
    if (txFilter === "all") return transactions.slice(0, 12);
    return transactions.filter((t) => t.status === txFilter).slice(0, 12);
  }, [transactions, txFilter]);

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Client dashboard</h1>
        <p>Track books, members, and circulation from one place.</p>
      </div>

      {loading ? (
        <div className="status" role="status">
          <span className="spinner" aria-hidden /> Loading dashboard...
        </div>
      ) : error ? (
        <div className="status status--error">{error}</div>
      ) : (
        <>
          <div className="client-grid client-grid--stats">
            <div className="card client-stat">
              <p className="client-stat__label">Titles</p>
              <h3 className="client-stat__value">{metrics.totalTitles}</h3>
            </div>
            <div className="card client-stat">
              <p className="client-stat__label">Members</p>
              <h3 className="client-stat__value">{metrics.totalMembers}</h3>
            </div>
            <div className="card client-stat">
              <p className="client-stat__label">Issued</p>
              <h3 className="client-stat__value">{metrics.issuedCount}</h3>
            </div>
            <div className="card client-stat">
              <p className="client-stat__label">Overdue</p>
              <h3 className="client-stat__value">{metrics.overdueCount}</h3>
            </div>
          </div>

          <div className="client-grid client-grid--main">
            <section className="card">
              <div className="client-panel__head">
                <h2 className="card__title">Books explorer</h2>
                <Link className="topbar__link" to="/books">
                  Manage books
                </Link>
              </div>

              <div className="form-row" style={{ marginBottom: "0.9rem" }}>
                <div className="field">
                  <label htmlFor="book-search">Search titles/authors</label>
                  <input
                    id="book-search"
                    className="input"
                    placeholder="Type to filter..."
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={3}>No books found.</td>
                      </tr>
                    ) : (
                      filteredBooks.map((b) => (
                        <tr key={b.id}>
                          <td>{b.title}</td>
                          <td>{b.author}</td>
                          <td>
                            {b.available}/{b.quantity}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <div className="client-panel__head">
                <h2 className="card__title">Circulation</h2>
                <Link className="topbar__link" to="/transactions">
                  Open transactions
                </Link>
              </div>

              <div className="form-row" style={{ marginBottom: "0.9rem" }}>
                <div className="field" style={{ minWidth: 180 }}>
                  <label htmlFor="tx-filter">Filter status</label>
                  <select
                    id="tx-filter"
                    className="input"
                    value={txFilter}
                    onChange={(e) => setTxFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="issued">Issued</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
                <div className="field" style={{ minWidth: 130 }}>
                  <label>Total results</label>
                  <div className="client-kpi">{filteredTransactions.length}</div>
                </div>
              </div>

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
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={3}>No transactions found.</td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.member_name}</td>
                          <td>{t.book_title}</td>
                          <td>
                            <span
                              className={
                                t.status === "overdue"
                                  ? "badge badge--warning"
                                  : t.status === "returned"
                                  ? "badge badge--success"
                                  : "badge badge--info"
                              }
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="client-grid client-grid--quick">
            <Link to="/add-book" className="card client-quick">
              <h3>Add new book</h3>
              <p>Create new title entries quickly.</p>
            </Link>
            <Link to="/members" className="card client-quick">
              <h3>Add member</h3>
              <p>Register library members and contacts.</p>
            </Link>
            <Link to="/transactions" className="card client-quick">
              <h3>Issue/Return</h3>
              <p>Process circulation and track due dates.</p>
            </Link>
          </div>
        </>
      )}
    </MainLayout>
  );
}

