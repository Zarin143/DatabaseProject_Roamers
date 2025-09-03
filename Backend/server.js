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
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("Registration error:", err);

        // Handle duplicate email error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }

        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({ message: "User registered successfully", role });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// =============================
// 🔹 LOGIN Route
// =============================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  });
});

// =========================
// POST Add Tourist Spot
// =========================
app.post("/tourist-spots", (req, res) => {
  const {
    name,
    category,
    location,
    distance_from_current_location,
    estimated_travel_time,
    description,
    image_url
  } = req.body;

  if (!name || !category || !location || !distance_from_current_location) {
    return res.status(400).json({
      error: "Name, category, location, and distance_from_current_location are required"
    });
  }

  const sql = `INSERT INTO tourist_spots 
    (name, category, location, distance_from_current_location, estimated_travel_time, description, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    name,
    category,
    location,
    distance_from_current_location,
    estimated_travel_time,
    description,
    image_url
  ], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "DB insert failed", details: err });
    }
    res.json({ message: "Spot added successfully" });
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
// 🔹 Middleware to Verify Token
// =============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// =============================
// 🔹 /auth/me Route
// =============================
app.get("/auth/me", authenticateToken, (req, res) => {
  const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
});



// =============================
// 🔹 Start Server
// =============================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
