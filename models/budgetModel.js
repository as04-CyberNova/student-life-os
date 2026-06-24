const db = require('../config/db');

const Budget = {
  // --- Transactions (Personal Ledger) ---
  async createTransaction({ user_id, amount, category, type, description, transaction_date }) {
    const sql = `INSERT INTO budget_transactions (user_id, amount, category, type, description, transaction_date)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [user_id, amount, category, type, description, transaction_date]);
    return result.insertId;
  },

  async getTransactions(user_id) {
    const sql = `SELECT * FROM budget_transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC`;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  },

  async deleteTransaction(id, user_id) {
    const sql = `DELETE FROM budget_transactions WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [id, user_id]);
    return result.affectedRows > 0;
  },

  async getMonthlySummary(user_id) {
    // Current month expenses by category
    const sql = `SELECT category, SUM(amount) as total 
                 FROM budget_transactions 
                 WHERE user_id = ? 
                   AND type = 'expense' 
                   AND MONTH(transaction_date) = MONTH(CURRENT_DATE()) 
                   AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
                 GROUP BY category`;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  },

  // --- Roommate Splits (Shared Ledger) ---
  async createDebt({ user_id, roommate_name, amount, description, transaction_date }) {
    const sql = `INSERT INTO roommate_debts (user_id, roommate_name, amount, description, transaction_date)
                 VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [user_id, roommate_name, amount, description, transaction_date]);
    return result.insertId;
  },

  async getDebts(user_id) {
    const sql = `SELECT * FROM roommate_debts WHERE user_id = ? ORDER BY transaction_date DESC, id DESC`;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  },

  async getRoommateBalances(user_id) {
    // Calculates net balance for each roommate name
    // Positive means they owe the user, Negative means the user owes them
    const sql = `SELECT roommate_name, SUM(amount) as net_balance 
                 FROM roommate_debts 
                 WHERE user_id = ? AND status = 'pending'
                 GROUP BY roommate_name`;
    const [rows] = await db.query(sql, [user_id]);
    return rows;
  },

  async settleDebtsWithRoommate(user_id, roommate_name) {
    const sql = `UPDATE roommate_debts SET status = 'settled' 
                 WHERE user_id = ? AND roommate_name = ? AND status = 'pending'`;
    const [result] = await db.query(sql, [user_id, roommate_name]);
    return result.affectedRows > 0;
  }
};

module.exports = Budget;
