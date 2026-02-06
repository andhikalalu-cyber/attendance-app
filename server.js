const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// SQLite database
const db = new sqlite3.Database('./attendance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY,
      json TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  }
});

// Load data from database
function loadData(callback) {
  db.all("SELECT json FROM data WHERE id = 1", (err, rows) => {
    if (err) {
      console.error(err);
      callback({
        classes: [{ name: 'Default Class', teacher: '', students: ['Alice', 'Bob', 'Charlie', 'Diana'], attendanceData: {} }],
        currentClassIndex: 0
      });
    } else if (rows.length > 0) {
      callback(JSON.parse(rows[0].json));
    } else {
      const defaultData = {
        classes: [{ name: 'Default Class', teacher: '', students: ['Alice', 'Bob', 'Charlie', 'Diana'], attendanceData: {} }],
        currentClassIndex: 0
      };
      callback(defaultData);
    }
  });
}

// Save data to database
function saveData(data, callback) {
  const json = JSON.stringify(data);
  db.run("INSERT OR REPLACE INTO data (id, json) VALUES (1, ?)", [json], (err) => {
    if (callback) callback(err);
  });
}

// API routes
app.get('/api/data', (req, res) => {
  loadData((data) => {
    res.json(data);
  });
});

app.post('/api/data', (req, res) => {
  saveData(req.body, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Attendance app is running at http://localhost:${port}`);
});
