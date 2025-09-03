// backend/routes/place.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Add Place
router.post("/", async (req, res) => {
  try {
    const { name, city, category } = req.body;

    await pool.query(
      `INSERT INTO Place (Name, City, Category) VALUES (?, ?, ?)`,
      [name, city, category]
    );

    res.json({ message: "Place added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Places
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Place");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
