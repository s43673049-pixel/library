import { useEffect, useMemo, useState } from "react";
import { getBooks, getMembers, getTransactions, issueBook, returnBook } from "../services/api";
import MainLayout from "../layout/Mainlayout";

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "overdue") return "badge badge--warning";
  if (s === "returned") return "badge badge--success";
  return "badge badge--info"; // issued
}

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function Transactions() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [historyTransactions, setHistoryTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [memberId, setMemberId] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");

  const [returningId, setReturningId] = useState(null);
  const [returnError, setReturnError] = useState("");

  const defaultDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const loadAll = async () => {
    try {
      setError("");
      setLoading(true);

      const [membersRes, booksRes, activeRes, historyRes] = await Promise.all([
        getMembers(),
        getBooks(),
        getTransactions(true),
        getTransactions(false),
      ]);

      setMembers(membersRes.data);
      setBooks(booksRes.data);
      setActiveTransactions(activeRes.data);
      setHistoryTransactions(historyRes.data);

      // Initialize selects on first load
      setMemberId((prev) => (prev ? prev : String(membersRes.data?.[0]?.id ?? "")));
      setBookId((prev) => (prev ? prev : String(booksRes.data?.[0]?.id ?? "")));
      setDueDate((prev) => (prev ? prev : defaultDueDate));
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIssue = async () => {
    setIssueError("");

    const m = Number(memberId);
    const b = Number(bookId);
    if (!Number.isFinite(m) || !Number.isFinite(b)) {
      setIssueError("Select a member and a book.");
      return;
    }

    try {
      setIssuing(true);
      await issueBook({ memberId: m, bookId: b, dueDate: dueDate || null });
      await loadAll();
    } catch (err) {
      console.error(err);
      setIssueError(err?.response?.data?.message || "Failed to issue book.");
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (txId) => {
    setReturnError("");
    const ok = window.confirm("Mark this transaction as returned?");
    if (!ok) return;

    try {
      setReturningId(txId);
      await returnBook({ transactionId: txId });
      await loadAll();
    } catch (err) {
      console.error(err);
      setReturnError(err?.response?.data?.message || "Failed to return book.");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Transactions</h1>
        <p>Issue and return books, and track overdue status.</p>
      </div>

      {loading ? (
        <div className="status" role="status">
          <span className="spinner" aria-hidden /> Loading…
        </div>
      ) : error ? (
        <div className="status status--error">{error}</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h2 className="card__title" style={{ marginBottom: "0.9rem" }}>
              Issue a book
            </h2>

            {issueError ? (
              <div className="status status--error" style={{ marginBottom: "1rem" }}>
                {issueError}
              </div>
            ) : null}

            <div className="form-row">
              <div className="field">
                <label htmlFor="tx-member">Member</label>
                <select
                  id="tx-member"
                  className="input"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="tx-book">Book</label>
                <select
                  id="tx-book"
                  className="input"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={Number(b.available) <= 0}>
                      {b.title} {Number(b.available) > 0 ? "" : "(no copies)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ minWidth: 190 }}>
                <label htmlFor="tx-due">Due date</label>
                <input
                  id="tx-due"
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <button className="btn btn--primary" type="button" onClick={handleIssue} disabled={issuing}>
                {issuing ? "Issuing..." : "Issue"}
              </button>
            </div>
          </div>

          {returnError ? (
            <div className="status status--error" style={{ marginBottom: "1rem" }}>
              {returnError}
            </div>
          ) : null}

          <div className="dashboard-grid">
            <section className="card">
              <h2 className="card__title" style={{ marginBottom: "0.9rem" }}>
                Active transactions
              </h2>

              {activeTransactions.length === 0 ? (
                <div className="empty-state" style={{ padding: "1.25rem" }}>
                  No active issues.
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Book</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {activeTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.member_name}</td>
                          <td>{t.book_title}</td>
                          <td>{formatDate(t.due_date)}</td>
                          <td>
                            <span className={statusBadge(t.status)}>{t.status}</span>
                          </td>
                          <td style={{ width: 120 }}>
                            <button
                              type="button"
                              className="btn btn--success"
                              disabled={returningId === t.id}
                              onClick={() => handleReturn(t.id)}
                            >
                              {returningId === t.id ? "Returning..." : "Return"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="card__title" style={{ marginBottom: "0.9rem" }}>
                History
              </h2>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Book</th>
                      <th>Issued</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="empty-state" style={{ padding: "1rem" }}>
                            No transactions yet.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      historyTransactions.slice(0, 20).map((t) => (
                        <tr key={t.id}>
                          <td>{t.member_name}</td>
                          <td>{t.book_title}</td>
                          <td>{formatDate(t.issued_at)}</td>
                          <td>
                            <span className={statusBadge(t.status)}>{t.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      )}
    </MainLayout>
  );
}

