import express from 'express';
import db from './db.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors()); 

// =============================
// 🔹 Test route
// =============================
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// =============================
// 🔹 Fetch all users 
// =============================
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// =============================
// 🔹 REGISTER Route
// =============================
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        // Handle duplicate email error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// 🔹 LOGIN Route
// =============================
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Success
    res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email } });
  });
});

// =============================
// 🔹 GET tourist spots by category
// =============================
app.get('/tourist-spots', (req, res) => {
  const sql = "SELECT * FROM tourist_spots ORDER BY category";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching spots:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


// =============================
// 🔹 Start Server
// =============================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
