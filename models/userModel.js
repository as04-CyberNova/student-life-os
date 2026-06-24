const db = require('../config/db');

const User = {
  // Create a new user
  async create({ name, email, password, college, branch, year_of_study }) {
    const sql = `INSERT INTO users (name, email, password, college, branch, year_of_study) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [name, email, password, college, branch, year_of_study]);
    return result.insertId;
  },

  // Find user by email
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.query(sql, [email]);
    return rows[0];
  },

  // Find user by ID
  async findById(id) {
    const sql = `SELECT id, name, email, college, branch, year_of_study, created_at 
                 FROM users WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  }
};

module.exports = User;
