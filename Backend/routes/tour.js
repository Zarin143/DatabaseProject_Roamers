// backend/routes/tour.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Create Community Tour
router.post("/", async (req, res) => {
  try {
    const { place_id, tour_date, cost_per_person } = req.body;

    await pool.query(
      `INSERT INTO Community_tour (Place_id, Tour_date, Cost_per_person) 
       VALUES (?, ?, ?)`,
      [place_id, tour_date, cost_per_person]
    );

    res.json({ message: "Tour created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a Tour
router.post("/book", async (req, res) => {
  try {
    const { user_id, tour_id } = req.body;

    await pool.query(
      `INSERT INTO Books (U_ID, Tour_id) VALUES (?, ?)`,
      [user_id, tour_id]
    );

    // Increase total enrolled
    await pool.query(
      `UPDATE Community_tour SET Total_enrolled = Total_enrolled + 1 WHERE Tour_id = ?`,
      [tour_id]
    );

    res.json({ message: "Tour booked successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Tours
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.Tour_id, p.Name AS Place, t.Tour_date, t.Cost_per_person, t.Total_enrolled
      FROM Community_tour t
      JOIN Place p ON t.Place_id = p.Place_id
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
