const db = require('../config/db');

const Chore = {
  // --- Laundry (Dhobi Tracker) ---
  async createLaundryLog({ user_id, item_count, sent_date, expected_return_date, cost, notes }) {
    const sql = `INSERT INTO laundry_logs (user_id, item_count, sent_date, expected_return_date, cost, notes, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'with_dhobi')`;
    const [result] = await db.query(sql, [user_id, item_count, sent_date, expected_return_date, cost, notes]);
    return result.insertId;
  },

  async getLaundryLogs(user_id) {
    const sql = `SELECT * FROM laundry_logs WHERE user_id = ? ORDER BY sent_date DESC, id DESC`;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  },

  async returnLaundry(id, user_id, actual_return_date, final_cost) {
    const sql = `UPDATE laundry_logs 
                 SET status = 'returned', actual_return_date = ?, cost = ? 
                 WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [actual_return_date, final_cost, id, user_id]);
    return result.affectedRows > 0;
  },

  // --- Water Can Tracker ---
  async createWaterCanLog({ user_id, opened_date, expected_end_date }) {
    // First, deactivate any existing water can logs for this user
    await db.query(`UPDATE water_can_logs SET is_active = FALSE WHERE user_id = ?`, [user_id]);
    
    // Create new active log
    const sql = `INSERT INTO water_can_logs (user_id, opened_date, expected_end_date, is_active)
                 VALUES (?, ?, ?, TRUE)`;
    const [result] = await db.query(sql, [user_id, opened_date, expected_end_date]);
    return result.insertId;
  },

  async getActiveWaterCan(user_id) {
    const sql = `SELECT * FROM water_can_logs WHERE user_id = ? AND is_active = TRUE LIMIT 1`;
    const [rows] = await db.query(sql, [user_id]);
    return rows[0];
  }
};

module.exports = Chore;
