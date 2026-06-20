import { useEffect, useState } from "react";
import { getBooks, addBook, deleteBook } from "../services/api";
import MainLayout from "../layout/Mainlayout";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [errorBooks, setErrorBooks] = useState("");

  const [adding, setAdding] = useState(false);
  const [errorAdd, setErrorAdd] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [errorDelete, setErrorDelete] = useState("");

  const loadBooks = async () => {
    try {
      setErrorBooks("");
      setLoadingBooks(true);
      const res = await getBooks();
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      setErrorBooks("Failed to load books.");
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAdd = async () => {
    setErrorAdd("");
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();

    if (!cleanTitle || !cleanAuthor) {
      setErrorAdd("Please enter both title and author.");
      return;
    }

    try {
      setAdding(true);
      await addBook({ title: cleanTitle, author: cleanAuthor });
      setTitle("");
      setAuthor("");
      await loadBooks();
    } catch (err) {
      console.error(err);
      setErrorAdd("Error adding book.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setErrorDelete("");
    const ok = window.confirm("Delete this book? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteBook(id);
      await loadBooks();
    } catch (err) {
      console.error(err);
      setErrorDelete("Error deleting book.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books
    .filter((b) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return `${b.title ?? ""} ${b.author ?? ""}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "id") return Number(b.id) - Number(a.id);
      if (sortBy === "author") return (a.author ?? "").localeCompare(b.author ?? "");
      return (a.title ?? "").localeCompare(b.title ?? "");
    });

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Books</h1>
        <p>Browse the catalog and manage inventory.</p>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 className="card__title">Add a book</h2>

        {errorAdd ? (
          <div className="status status--error" style={{ marginBottom: "1rem" }}>
            {errorAdd}
          </div>
        ) : null}

        <div className="form-row">
          <div className="field">
            <label htmlFor="book-title">Title</label>
            <input
              id="book-title"
              className="input"
              placeholder="e.g. The Hobbit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="book-author">Author</label>
            <input
              id="book-author"
              className="input"
              placeholder="e.g. J.R.R. Tolkien"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn--success"
            onClick={handleAdd}
            disabled={adding}
            style={{ alignSelf: "flex-end" }}
          >
            {adding ? "Adding..." : "Add book"}
          </button>
        </div>
      </div>

      {errorDelete ? (
        <div className="status status--error" style={{ marginBottom: "1rem" }}>
          {errorDelete}
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 className="card__title" style={{ marginBottom: "0.75rem" }}>
          Search & sort
        </h2>

        <div className="form-row">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              className="input"
              placeholder="Type a title or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="field" style={{ minWidth: 180 }}>
            <label htmlFor="sortBy">Sort by</label>
            <select
              id="sortBy"
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="id">Newest</option>
            </select>
          </div>

          <div className="field" style={{ minWidth: 140 }}>
            <label>Result count</label>
            <div style={{ paddingTop: "0.65rem", fontWeight: 700 }}>
              {filteredBooks.length}
            </div>
          </div>
        </div>
      </div>

      <div className="book-list">
        {loadingBooks ? (
          <div className="status" role="status">
            <span className="spinner" aria-hidden /> Loading books...
          </div>
        ) : errorBooks ? (
          <div className="status status--error">{errorBooks}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            No books match your search. Add one above or use “Add Book” in the sidebar.
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div key={book.id} className="book-row">
              <div className="book-row__meta">
                {book.title} <span>— {book.author}</span>
              </div>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleDelete(book.id)}
                disabled={deletingId === book.id}
              >
                {deletingId === book.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}

export default Books;
