const db = require('../config/db');

const Directory = {
  async getAllForUser(userId) {
    const sql = `SELECT * FROM survival_directory WHERE user_id = ? ORDER BY rating DESC, name ASC`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async addService({ user_id, name, service_type, phone, operating_hours, pricing_info, rating }) {
    const sql = `INSERT INTO survival_directory (user_id, name, service_type, phone, operating_hours, pricing_info, rating)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [user_id, name, service_type, phone, operating_hours, pricing_info, rating || 5]);
    return result.insertId;
  },

  async deleteService(id, userId) {
    const sql = `DELETE FROM survival_directory WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }
};

module.exports = Directory;
