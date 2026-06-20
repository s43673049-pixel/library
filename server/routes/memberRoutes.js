const router = require("express").Router();
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const rows = await db.promise().query(
      "SELECT id, name, email, phone, created_at FROM members ORDER BY created_at DESC"
    );
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load members" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const nameTrim = String(name).trim();
    const emailLower = email ? String(email).trim().toLowerCase() : null;
    const phoneTrim = phone ? String(phone).trim() : null;

    const result = await db
      .promise()
      .query("INSERT INTO members(name, email, phone) VALUES(?,?,?)", [
        nameTrim,
        emailLower,
        phoneTrim,
      ]);

    return res.status(201).json({ message: "Member added", id: result[0].insertId });
  } catch (err) {
    console.error(err);
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Member email already exists" });
    }
    return res.status(500).json({ message: "Failed to add member" });
  }
});

module.exports = router;
