const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const auth = require("../middleware/authMiddleware");

function signToken(user) {
  const payload = { id: user.id, email: user.email, name: user.name };
  const secret = process.env.JWT_SECRET || "change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const emailLower = String(email).trim().toLowerCase();
    const existing = await db
      .promise()
      .query("SELECT id FROM users WHERE email = ?", [emailLower]);

    if (existing[0].length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db
      .promise()
      .query("INSERT INTO users(name, email, password_hash) VALUES(?,?,?)", [
        name.trim(),
        emailLower,
        passwordHash,
      ]);

    const insertedId = result[0].insertId;

    const userRows = await db
      .promise()
      .query("SELECT id, name, email FROM users WHERE id = ?", [insertedId]);

    const user = userRows[0][0];
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const emailLower = String(email).trim().toLowerCase();

    const rows = await db.promise().query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [emailLower]
    );

    const user = rows[0][0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", auth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;

