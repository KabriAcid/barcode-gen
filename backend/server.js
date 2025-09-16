// SQLite setup and Express server for barcode-gen
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const dbPath = path.join(__dirname, "barcodegen.db");
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..")));

// --- SQL Schema ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    name TEXT,
    labelSize TEXT,
    copies INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

// --- Auth Endpoints ---
app.post("/api/register", (req, res) => {
  const { username, password, phone } = req.body;
  if (!username || !password || !phone)
    return res.status(400).json({ error: "Missing fields" });
  db.run(
    "INSERT INTO users (username, password, phone) VALUES (?, ?, ?)",
    [username, password, phone],
    function (err) {
      if (err)
        return res.status(400).json({ error: "Username already exists" });
      res.json({ success: true, userId: this.lastID });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT id FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err || !row)
        return res.status(401).json({ error: "Invalid credentials" });
      res.json({ success: true, userId: row.id });
    }
  );
});

// --- History Endpoints ---
app.get("/api/history", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  db.all(
    "SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

app.post("/api/history", (req, res) => {
  const { userId, value, name, labelSize, copies } = req.body;
  if (!userId || !value)
    return res.status(400).json({ error: "Missing fields" });
  db.run(
    "INSERT INTO history (user_id, value, name, labelSize, copies) VALUES (?, ?, ?, ?, ?)",
    [userId, value, name, labelSize, copies],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
