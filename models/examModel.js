const db = require('../config/db');

const Exam = {
  async getAllForUser(userId) {
    const sql = `SELECT * FROM exam_planner WHERE user_id = ? ORDER BY exam_date ASC`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async addExam({ user_id, subject_name, exam_date, high_weightage_topics, resources_links }) {
    const sql = `INSERT INTO exam_planner (user_id, subject_name, exam_date, high_weightage_topics, resources_links, preparation_status)
                 VALUES (?, ?, ?, ?, ?, 'not_started')`;
    const [result] = await db.query(sql, [
      user_id,
      subject_name,
      exam_date,
      high_weightage_topics,
      JSON.stringify(resources_links || {})
    ]);
    return result.insertId;
  },

  async updateStatus(id, userId, status) {
    const sql = `UPDATE exam_planner SET preparation_status = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [status, id, userId]);
    return result.affectedRows > 0;
  },

  async deleteExam(id, userId) {
    const sql = `DELETE FROM exam_planner WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }
};

module.exports = Exam;
