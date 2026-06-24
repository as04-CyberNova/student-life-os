const db = require('../config/db');

const Academic = {
  // --- Curated Concepts ("Explain It Two Ways") ---
  async getAllConcepts() {
    const sql = `SELECT * FROM curated_concepts ORDER BY subject ASC, topic ASC`;
    const [rows] = await db.query(sql);
    return rows;
  },

  async getConceptsBySubject(subject) {
    const sql = `SELECT * FROM curated_concepts WHERE subject = ? ORDER BY topic ASC`;
    const [rows] = await db.query(sql, [subject]);
    return rows;
  },

  async getConceptById(id) {
    const sql = `SELECT * FROM curated_concepts WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  // --- Concept Gaps ---
  async getConceptGaps(userId) {
    const sql = `SELECT cg.*, cc.subject, cc.topic, cc.simple_explanation, cc.technical_explanation 
                 FROM concept_gaps cg
                 JOIN curated_concepts cc ON cg.concept_id = cc.id
                 WHERE cg.user_id = ?
                 ORDER BY cg.status ASC, cc.topic ASC`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async logConceptGap(userId, conceptId) {
    const sql = `INSERT INTO concept_gaps (user_id, concept_id, status)
                 VALUES (?, ?, 'identified')
                 ON DUPLICATE KEY UPDATE status = 'identified'`;
    const [result] = await db.query(sql, [userId, conceptId]);
    return result.affectedRows > 0;
  },

  async updateConceptGapStatus(userId, conceptId, status, quizScore = null) {
    const sql = `UPDATE concept_gaps 
                 SET status = ?, quiz_score = ?
                 WHERE user_id = ? AND concept_id = ?`;
    const [result] = await db.query(sql, [status, quizScore, userId, conceptId]);
    return result.affectedRows > 0;
  },

  // --- Project Scopes ---
  async getProjectScopes(userId) {
    const sql = `SELECT * FROM project_scopes WHERE user_id = ? ORDER BY created_at DESC`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async addProjectScope({ user_id, title, description, tech_stack, difficulty, milestones }) {
    const sql = `INSERT INTO project_scopes (user_id, title, description, tech_stack, difficulty, milestones)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      user_id,
      title,
      description,
      tech_stack,
      difficulty,
      JSON.stringify(milestones)
    ]);
    return result.insertId;
  },

  async deleteProjectScope(id, userId) {
    const sql = `DELETE FROM project_scopes WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }
};

module.exports = Academic;
