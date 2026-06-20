const router = require("express").Router();
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

router.use(auth);

function toISODate(d) {
  // Returns YYYY-MM-DD
  return new Date(d).toISOString().slice(0, 10);
}

router.get("/", async (req, res) => {
  try {
    const active = String(req.query.active ?? "").toLowerCase() === "true";

    const where = active ? "WHERE t.returned_at IS NULL" : "";

    const rows = await db.promise().query(
      `SELECT
        t.id,
        t.issued_at,
        t.due_date,
        t.returned_at,
        b.id AS book_id,
        b.title AS book_title,
        b.author AS book_author,
        m.id AS member_id,
        m.name AS member_name,
        m.email AS member_email,
        CASE
          WHEN t.returned_at IS NULL
           AND t.due_date IS NOT NULL
           AND t.due_date < CURDATE()
          THEN 'overdue'
          WHEN t.returned_at IS NULL THEN 'issued'
          ELSE 'returned'
        END AS status
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      JOIN members m ON m.id = t.member_id
      ${where}
      ORDER BY t.issued_at DESC
      LIMIT 200`
    );

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load transactions" });
  }
});

router.post("/issue", async (req, res) => {
  try {
    const { memberId, bookId, dueDate } = req.body;
    if (!memberId || !bookId) {
      return res.status(400).json({ message: "memberId and bookId are required" });
    }

    const memberIdNum = Number(memberId);
    const bookIdNum = Number(bookId);
    if (!Number.isFinite(memberIdNum) || !Number.isFinite(bookIdNum)) {
      return res.status(400).json({ message: "Invalid memberId/bookId" });
    }

    // Pick a due date (default 14 days)
    const due =
      dueDate && String(dueDate).trim()
        ? String(dueDate).slice(0, 10)
        : toISODate(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const conn = db.promise();
    await conn.beginTransaction();

    const [bookRows] = await conn.query(
      "SELECT id, available, quantity FROM books WHERE id = ? FOR UPDATE",
      [bookIdNum]
    );
    const book = bookRows[0];
    if (!book) {
      await conn.rollback();
      return res.status(404).json({ message: "Book not found" });
    }
    if (Number(book.available) <= 0) {
      await conn.rollback();
      return res.status(409).json({ message: "No available copies for this book" });
    }

    const [memberRows] = await conn.query("SELECT id FROM members WHERE id = ?", [memberIdNum]);
    if (!memberRows[0]) {
      await conn.rollback();
      return res.status(404).json({ message: "Member not found" });
    }

    await conn.query("UPDATE books SET available = available - 1 WHERE id = ?", [bookIdNum]);

    const [txResult] = await conn.query(
      "INSERT INTO transactions(book_id, member_id, due_date, created_by) VALUES(?,?,?,?)",
      [bookIdNum, memberIdNum, due, req.user.id]
    );

    await conn.commit();
    return res.status(201).json({ message: "Book issued", transactionId: txResult.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to issue book" });
  }
});

router.post("/return", async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: "transactionId is required" });
    }

    const txIdNum = Number(transactionId);
    if (!Number.isFinite(txIdNum)) {
      return res.status(400).json({ message: "Invalid transactionId" });
    }

    const conn = db.promise();
    await conn.beginTransaction();

    const [txRows] = await conn.query(
      "SELECT id, book_id FROM transactions WHERE id = ? AND returned_at IS NULL FOR UPDATE",
      [txIdNum]
    );
    const tx = txRows[0];
    if (!tx) {
      await conn.rollback();
      return res.status(404).json({ message: "Active transaction not found" });
    }

    await conn.query("UPDATE transactions SET returned_at = NOW() WHERE id = ?", [txIdNum]);
    await conn.query("UPDATE books SET available = available + 1 WHERE id = ?", [tx.book_id]);

    await conn.commit();
    return res.json({ message: "Book returned" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to return book" });
  }
});

module.exports = router;
