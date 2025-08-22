import mysql from 'mysql2';

// create connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // default XAMPP user
  password: '',       // default password is empty
  database: 'roamers_db'
});

// connect
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database!');
});

export default db;
