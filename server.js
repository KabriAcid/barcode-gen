const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, "history.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

function readHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.error("Error reading history file", e);
    return [];
  }
}

function writeHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// Get full history
app.get("/api/history", (req, res) => {
  res.json(readHistory());
});

// Append single entry
app.post("/api/history", (req, res) => {
  const { value, type, timestamp, labelSize, copies, id } = req.body || {};
  if (!value || !type) {
    return res.status(400).json({ error: "Missing value or type" });
  }
  const history = readHistory();
  const entry = {
    id: id || Date.now(),
    value,
    type,
    timestamp: timestamp || new Date().toISOString(),
    labelSize: labelSize || "50mm",
    copies: copies || 1,
  };
  history.unshift(entry);
  // keep last 200
  writeHistory(history.slice(0, 200));
  res.status(201).json(entry);
});

// Replace entire history (optional bulk save)
app.put("/api/history", (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "Body must be an array" });
  }
  writeHistory(req.body);
  res.json({ ok: true, count: req.body.length });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
