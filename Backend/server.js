import express from 'express';
import db from './db.js';

const app = express();
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// fetch all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
    } else {
      res.json(results);
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
