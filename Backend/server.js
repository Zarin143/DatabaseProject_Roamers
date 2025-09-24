import express from 'express';
import db from './db.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// =============================
// 🔹 JWT Secret
// =============================
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// =============================
// 🔹 Test route
// =============================
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// =============================
// 🔹 Enhanced Middleware to Verify Token and Check Admin Role
// =============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    // Fetch user from database to get current role
    const sql = "SELECT id, username, email, role FROM users WHERE id = ?";
    db.query(sql, [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });

      req.user = results[0]; // Now req.user has the complete user object with role
      next();
    });
  });
}

// =============================
// 🔹 Admin Authorization Middleware
// =============================
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// =============================
// 🔹 REGISTER Route
// =============================
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }

  // Prevent users from registering as admin
  if (role === 'admin') {
    return res.status(403).json({ error: "Cannot register as admin" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, userRole], (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "User registered successfully", role: userRole });
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  });
});

// =============================
// 🔹 GET single user by ID
// =============================
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, username, email, role FROM users WHERE id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(results[0]);
  });
});

// =============================
// 🔹 UPDATE user location
// =============================
app.put("/users/:id/location", async (req, res) => {
  const userId = req.params.id;
  const { location } = req.body;

  try {
    // First, add location column if it doesn't exist
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255)");

    // Update location in the database
    await db.query("UPDATE users SET location = ? WHERE id = ?", [location, userId]);
    res.status(200).json({ message: "Location updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update location" });
  }
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

// =========================
// POST Add Tourist Spot (Admin only)
// =========================
app.post("/tourist-spots", authenticateToken, requireAdmin, (req, res) => {
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
// 🔹 Get single tourist spot by ID
// =============================
app.get("/tourist-spots/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM tourist_spots WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching spot:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Spot not found" });
    }
    res.json(results[0]);
  });
});

// =============================
// 🔹 TOUR MANAGEMENT ROUTES
// =============================

// =============================
// 🔹 GET all community tours (for both admin and users)
// =============================
app.get('/community-tours', (req, res) => {
  const sql = `
    SELECT ct.*, ts.name as spot_name, ts.location, ts.category, ts.image_url
    FROM community_tour ct 
    JOIN tourist_spots ts ON ct.Place_id = ts.id 
    ORDER BY ct.Tour_date
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching community tours:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// =============================
// 🔹 GET all tourist spots for dropdown (Admin use)
// =============================
app.get('/tourist-spots-list', (req, res) => {
  const sql = "SELECT id, name, location FROM tourist_spots ORDER BY name";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching spots list:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// =============================
// 🔹 CREATE new community tour (Admin only)
// =============================
app.post('/admin/community-tours', authenticateToken, requireAdmin, (req, res) => {
  const { Place_id, Tour_date, Cost_per_person, Total_enrolled } = req.body;

  if (!Place_id || !Tour_date || !Cost_per_person) {
    return res.status(400).json({ error: "Place, date, and cost are required" });
  }

  const sql = `
    INSERT INTO community_tour (Place_id, Tour_date, Cost_per_person, Total_enrolled) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [Place_id, Tour_date, Cost_per_person, Total_enrolled || 0], (err, result) => {
    if (err) {
      console.error("Error creating tour:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({
      message: "Tour created successfully",
      tourId: result.insertId,
      tour: {
        Tour_id: result.insertId,
        Place_id,
        Tour_date,
        Cost_per_person,
        Total_enrolled: Total_enrolled || 0
      }
    });
  });
});

// =============================
// 🔹 UPDATE community tour (Admin only)
// =============================
app.put('/admin/community-tours/:tourId', authenticateToken, requireAdmin, (req, res) => {
  const tourId = req.params.tourId;
  const { Place_id, Tour_date, Cost_per_person, Total_enrolled } = req.body;

  const sql = `
    UPDATE community_tour 
    SET Place_id = ?, Tour_date = ?, Cost_per_person = ?, Total_enrolled = ?
    WHERE Tour_id = ?
  `;

  db.query(sql, [Place_id, Tour_date, Cost_per_person, Total_enrolled, tourId], (err, result) => {
    if (err) {
      console.error("Error updating tour:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }
    res.json({ message: "Tour updated successfully" });
  });
});

// =============================
// 🔹 DELETE community tour (Admin only)
// =============================
app.delete('/admin/community-tours/:tourId', authenticateToken, requireAdmin, (req, res) => {
  const tourId = req.params.tourId;

  const sql = 'DELETE FROM community_tour WHERE Tour_id = ?';

  db.query(sql, [tourId], (err, result) => {
    if (err) {
      console.error("Error deleting tour:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }
    res.json({ message: "Tour deleted successfully" });
  });
});

// =============================
// 🔹 JOIN community tour (User)
// =============================
app.post('/community-tours/:tourId/join', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: "Admins cannot join tours" });
  }
  const tourId = req.params.tourId;
  const userId = req.user.id;

  // First check if user already joined
  const checkSql = 'SELECT * FROM tour_participants WHERE tour_id = ? AND user_id = ?';
  db.query(checkSql, [tourId, userId], (err, results) => {
    if (err) {
      console.error("Error checking participation:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "You have already joined this tour" });
    }

    // Join the tour
    const joinSql = 'INSERT INTO tour_participants (tour_id, user_id) VALUES (?, ?)';
    db.query(joinSql, [tourId, userId], (err, result) => {
      if (err) {
        console.error("Error joining tour:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Update total enrolled count
      const updateSql = 'UPDATE community_tour SET Total_enrolled = Total_enrolled + 1 WHERE Tour_id = ?';
      db.query(updateSql, [tourId], (err, result) => {
        if (err) {
          console.error("Error updating enrollment:", err);
        }
        res.json({ message: "Successfully joined the tour" });
      });
    });
  });
});

// =============================
// 🔹 GET tour participants (Admin only)
// =============================
app.get('/admin/community-tours/:tourId/participants', authenticateToken, requireAdmin, (req, res) => {
  const tourId = req.params.tourId;

  const sql = `
    SELECT u.id, u.username, u.email, tp.joined_at 
    FROM tour_participants tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.tour_id = ?
    ORDER BY tp.joined_at DESC
  `;

  db.query(sql, [tourId], (err, results) => {
    if (err) {
      console.error("Error fetching participants:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// =============================
// 🔹 ADD THESE COMPATIBILITY ROUTES
// =============================

// Compatibility route - your frontend calls /tours but backend has /community-tours
app.get('/tours', (req, res) => {
  const sql = `
    SELECT ct.*, ts.name as place_name, ts.location, ts.image_url
    FROM community_tour ct 
    JOIN tourist_spots ts ON ct.Place_id = ts.id 
    ORDER BY ct.Tour_date
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching tours:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Compatibility route for tour creation
app.post('/tours', authenticateToken, requireAdmin, (req, res) => {
  const { placeId, tourDate, costPerPerson } = req.body;

  if (!placeId || !tourDate || !costPerPerson) {
    return res.status(400).json({ error: "Place, date, and cost are required" });
  } 

  const today = new Date();
  const selectedDate = new Date(tourDate);

  // Prevent past or today's dates
  if (selectedDate <= today) {
    return res.status(400).json({ error: "Tour date must be in the future" });
  }

  const sql = `
    INSERT INTO community_tour (Place_id, Tour_date, Cost_per_person, Total_enrolled) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [placeId, tourDate, costPerPerson, 0], (err, result) => {
    if (err) {
      console.error("Error creating tour:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({
      message: "Tour created successfully",
      tourId: result.insertId
    });
  });
});

// Compatibility route for joining tours
app.post('/tours/:tourId/join', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: "Admins cannot join tours" });
  }
  const tourId = req.params.tourId;
  const userId = req.user.id;

  db.query("SELECT * FROM community_tour WHERE Tour_id = ?", [tourId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Tour not found" });

    const tour = results[0];
    const today = new Date();
    const tourDate = new Date(tour.Tour_date);

    if (tourDate <= today) {
      return res.status(400).json({ error: "Cannot join a past tour" });
    }

    // Check duplicate enrollment
    db.query("SELECT * FROM tour_participants WHERE tour_id=? AND user_id=?", [tourId, userId], (err2, already) => {
      if (err2) return res.status(500).json({ error: "Database error" });
      if (already.length > 0) return res.status(400).json({ error: "Already joined this tour" });

      db.query("INSERT INTO tour_participants (tour_id, user_id) VALUES (?, ?)", [tourId, userId], (err3) => {
        if (err3) return res.status(500).json({ error: "Join failed" });

        db.query("UPDATE community_tour SET Total_enrolled = Total_enrolled + 1 WHERE Tour_id=?", [tourId]);
        res.json({ message: "Successfully joined the tour!" });
      });
    });
  });
});
app.put('/tours/:tourId', authenticateToken, requireAdmin, (req, res) => {
  const { tourId } = req.params;
  const { placeId, tourDate, costPerPerson } = req.body;

  if (!placeId || !tourDate || !costPerPerson) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const today = new Date();
  const selectedDate = new Date(tourDate);
  if (selectedDate <= today) {
    return res.status(400).json({ error: "New tour date must be in the future" });
  }

  const sql = `
    UPDATE community_tour 
    SET Place_id=?, Tour_date=?, Cost_per_person=? 
    WHERE Tour_id=?
  `;
  db.query(sql, [placeId, tourDate, costPerPerson, tourId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tour not found" });

    res.json({ message: "Tour updated successfully" });
  });
});
app.delete('/tours/:tourId', authenticateToken, requireAdmin, (req, res) => {
  const { tourId } = req.params;

  db.query("DELETE FROM community_tour WHERE Tour_id=?", [tourId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tour not found" });

    res.json({ message: "Tour deleted successfully" });
  });
});
// =============================
// 🔹 PUT recommended place
// =============================
app.put("/users/:id/location", async (req, res) => {
  const userId = req.params.id;
  const { location } = req.body;

  try {
    // Update location in the database
    await db.query("UPDATE users SET location = ? WHERE id = ?", [location, userId]);
    res.status(200).json({ message: "Location updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update location" });
  }
});

// =============================
// 🔹 Start Server
// =============================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});