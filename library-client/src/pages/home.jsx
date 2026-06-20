import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layout/Mainlayout";
import StatCard from "../components/StatCard";
import ActivityTable from "../components/ActivityTable";
import BookStatus from "../components/BookStatus";
import { getBooks, getMembers, getTransactions } from "../services/api";

import {
  FaBook,
  FaClipboardList,
  FaClock,
  FaUsers,
} from "react-icons/fa";

import "../styles/home.css";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberCount, setMemberCount] = useState(null);
  const [overdueCount, setOverdueCount] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getBooks();
        if (!mounted) return;
        setBooks(res.data);

        // Optional: if authenticated, load member/overdue stats too.
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const [membersRes, activeTxRes] = await Promise.all([
              getMembers(),
              getTransactions(true),
            ]);
            if (!mounted) return;
            setMemberCount(membersRes.data.length);
            setOverdueCount(
              (activeTxRes.data || []).filter((t) => t.status === "overdue").length
            );
          } catch {
            // Don't block dashboard if auth-protected stats fail.
          }
        }
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load books from the server.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalBooks = books.length;
    let availableCopies = 0;
    let borrowedCopies = 0;

    for (const b of books) {
      const qty = Number(b.quantity) || 0;
      const available = Number(b.available) || 0;
      availableCopies += available;
      borrowedCopies += Math.max(0, qty - available);
    }

    return {
      totalBooks,
      borrowedCopies,
      availableCopies,
    };
  }, [books]);


  return (
    <MainLayout>
      <div className="dashboard">
        <div className="dashboard__welcome">
          <h1>Welcome back</h1>
          <p>Here’s a snapshot of your library today.</p>
        </div>

        {error ? <div className="status status--error">{error}</div> : null}

        {loading ? (
          <div className="status" role="status">
            <span className="spinner" aria-hidden /> Loading dashboard...
          </div>
        ) : (
          <div className="stats-grid">
            <StatCard title="Total Books" 
            value={stats.totalBooks.toLocaleString()}  
            icon={FaBook} />

            <StatCard title="Books Borrowed" value={stats.borrowedCopies.toLocaleString()} icon={FaClipboardList} />

            <StatCard title="Overdue Books" value={(overdueCount ?? "—").toString()} icon={FaClock} />
            <StatCard title="Total Members" value={(memberCount ?? "—").toString()} icon={FaUsers} />
          </div>
        )}

        <div className="dashboard-grid">
          <ActivityTable books={books} loading={loading} />
          <BookStatus books={books} loading={loading} />
        </div>
      </div>
    </MainLayout>
  );
}
