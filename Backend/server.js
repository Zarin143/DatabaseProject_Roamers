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
// 🔹 Middleware to Verify Token (ONLY ONCE)
// =============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Access denied, no token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

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

// Get single tourist spot by ID
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
// 🔹 Add Tourist Spot to Favorites
// =============================
app.post("/favorites", authenticateToken, (req, res) => {
  const userId = req.user.id; // From JWT token
  const { spotId } = req.body;

  const sql = "INSERT INTO favorite_spots (user_id, spot_id) VALUES (?, ?)";
  db.query(sql, [userId, spotId], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Already in favorites" });
      }
      return res.status(500).json({ error: "DB insert failed" });
    }
    res.json({ message: "Added to favorites" });
  });
});

// =============================
// 🔹 Get User Favorites
// =============================
app.get("/favorites", authenticateToken, (req, res) => {
  const userId = req.user.id; // From JWT token
  const sql = `
    SELECT fs.id, ts.name, ts.location, ts.category, ts.image_url 
    FROM favorite_spots fs
    JOIN tourist_spots ts ON fs.spot_id = ts.id
    WHERE fs.user_id = ?;
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB fetch failed" });
    res.json(results);
  });
});

// =============================
// 🔹 Remove from Favorites
// =============================
app.delete("/favorites/:spotId", authenticateToken, (req, res) => {
  const userId = req.user.id; // From JWT token
  const { spotId } = req.params;
  const sql = "DELETE FROM favorite_spots WHERE user_id = ? AND spot_id = ?";
  db.query(sql, [userId, spotId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB delete failed" });
    res.json({ message: "Removed from favorites" });
  });
}); 

// =============================
// 🔹 POST Review
// =============================
app.post("/reviews", authenticateToken, (req, res) => {
  const { spotId, rating, comment } = req.body;
  const userId = req.user.id;

  const sql = "INSERT INTO reviews (user_id, spot_id, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, spotId, rating, comment], (err, result) => {
    if (err) {
      console.error("Review insert error:", err);
      return res.status(500).json({ error: "Failed to submit review" });
    }
    res.json({ message: "Review submitted successfully" });
  });
});

// =============================
// 🔹 GET Reviews for a Spot
// =============================
app.get("/reviews/:spotId", (req, res) => {
  const { spotId } = req.params;
  
  const sql = `
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.spot_id = ? 
    ORDER BY r.created_at DESC
  `;
  
  db.query(sql, [spotId], (err, results) => {
    if (err) {
      console.error("Review fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
    res.json(results);
  });
});


// =============================
// 🔹 GET Recommended place
// =============================
app.get("/recommended/:userId", (req, res) => {
  const userId = req.params.userId;

  // Get user's location
  const userQuery = "SELECT location FROM users WHERE id = ?";
  db.query(userQuery, [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userResult.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userLocation = userResult[0].location;

    // Fetch tourist spots matching user's location
    const spotsQuery = `
      SELECT * FROM tourist_spots
      WHERE FIND_IN_SET(?, location)
    `;
    db.query(spotsQuery, [userLocation], (err, spotsResult) => {
      if (err) return res.status(500).json({ error: err.message });

      // Insert recommended places into recommended_place table
      spotsResult.forEach((spot) => {
        const insertQuery = `
          INSERT INTO recommended_place (Nearby_place, Distance, Address, user_id, spot_id)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE Distance = VALUES(Distance), Address = VALUES(Address)
        `;
        db.query(
          insertQuery,
          [spot.name, spot.distance_from_current_location, spot.location, userId, spot.id],
          (err2) => {
            if (err2) console.error("Failed to insert recommended place:", err2.message);
          }
        );
      });

      // Return recommended spots to frontend
      res.json(spotsResult);
    });
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
// 🔹 POST Book Tour
// =============================
app.post("/bookings", async (req, res) => {
  const { user_id, spot_id, booking_date, num_people, special_request } = req.body;

  if (!user_id || !spot_id || !booking_date || !num_people) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Call the stored procedure
    db.query(
      "CALL AddBooking(?, ?, ?, ?, ?)",
      [user_id, spot_id, booking_date, num_people, special_request],
      (err, results) => {
        if (err) {
          console.error("Booking error:", err);
          return res.status(500).json({ success: false, message: "Booking failed" });
        }

        const message = results[0][0].message;
        if (message === "Booking successful") {
          res.json({ success: true, message });
        } else {
          res.status(500).json({ success: false, message });
        }
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
});


// =============================
// 🔹 GET Reviews for a Spot
// =============================
app.get("/reviews/:spotId", (req, res) => {
  const { spotId } = req.params;
  const sql = `
    SELECT r.id, r.rating, r.comment, r.user_id, r.created_at, u.username 
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.spot_id = ?
    ORDER BY r.created_at DESC
  `;
  db.query(sql, [spotId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch reviews" });
    res.json(results);
  });
});

// ✅ Add new review
app.post("/reviews", authenticateToken, (req, res) => {
  const { spotId, rating, comment } = req.body;
  const userId = req.user.id;

  const sql = "INSERT INTO reviews (spot_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [spotId, userId, rating, comment], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to submit review" });
    res.json({ message: "Review added successfully", id: result.insertId });
  });
});

// ✅ Update review (only owner)
app.put("/reviews/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const check = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";
  db.query(check, [id, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?";
    db.query(sql, [rating, comment, id], (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to update review" });
      res.json({ message: "Review updated" });
    });
  });
});

// ✅ Delete review (only owner)
app.delete("/reviews/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const check = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";
  db.query(check, [id, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    const sql = "DELETE FROM reviews WHERE id = ?";
    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to delete review" });
      res.json({ message: "Review deleted" });
    });
  });
});

// routes/mostvisited.js
app.get("/mostvisitedplaces", (req, res) => {
  const sql = "SELECT * FROM most_visited_place ORDER BY booking_count DESC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch most visited places" });
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