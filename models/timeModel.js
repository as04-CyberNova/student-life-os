const db = require('../config/db');

const TimeBudget = {
  // Get budgets and actuals for a specific week start date (YYYY-MM-DD)
  async getWeeklyBudgets(user_id, week_start_date) {
    const sql = `SELECT * FROM time_budgets WHERE user_id = ? AND week_start_date = ?`;
    const [rows] = await db.query(sql, [user_id, week_start_date]);
    return rows;
  },

  // Set or update a target for a category and week
  async setTarget({ user_id, category, target_hours, week_start_date }) {
    const sql = `INSERT INTO time_budgets (user_id, category, target_hours, week_start_date)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE target_hours = ?`;
    const [result] = await db.query(sql, [user_id, category, target_hours, week_start_date, target_hours]);
    return result.affectedRows > 0;
  },

  // Log actual hours spent on a category and week (accumulates value)
  async logHours({ user_id, category, hours, week_start_date }) {
    const sql = `INSERT INTO time_budgets (user_id, category, target_hours, actual_hours, week_start_date)
                 VALUES (?, ?, 0.00, ?, ?)
                 ON DUPLICATE KEY UPDATE actual_hours = actual_hours + ?`;
    const [result] = await db.query(sql, [user_id, category, hours, week_start_date, hours]);
    return result.affectedRows > 0;
  }
};

module.exports = TimeBudget;
