const Exam = require('../models/examModel');

const examController = {
  // Render Exam Planner sessional dashboard
  async getExamsIndex(req, res) {
    const user_id = req.session.user.id;
    try {
      const exams = await Exam.getAllForUser(user_id);
      
      // Parse resources and format topics for displaying
      const formattedExams = exams.map(e => {
        let resources = {};
        try {
          resources = typeof e.resources_links === 'string' ? JSON.parse(e.resources_links) : e.resources_links;
        } catch (err) {
          resources = {};
        }
        
        const topics = e.high_weightage_topics ? e.high_weightage_topics.split(',').map(t => t.trim()) : [];
        
        return {
          ...e,
          topics,
          resources
        };
      });

      res.render('exam', {
        title: 'One-Night-Before Exam Engine - Student Life OS',
        user: req.session.user,
        exams: formattedExams,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.render('exam', {
        title: 'One-Night-Before Exam Engine - Student Life OS',
        user: req.session.user,
        exams: [],
        error: 'Failed to load exams list.',
        success: null
      });
    }
  },

  // Log a new exam schedule and auto-generate resource searches
  async postExam(req, res) {
    const user_id = req.session.user.id;
    const { subject_name, exam_date, high_weightage_topics } = req.body;

    if (!subject_name || !exam_date || !high_weightage_topics) {
      return res.redirect('/exams?error=Missing required exam details.');
    }

    try {
      // Auto-generate search engine resource queries for the topics
      const topicsList = high_weightage_topics.split(',').map(t => t.trim());
      const resources_links = {};

      topicsList.forEach(topic => {
        const query = encodeURIComponent(`BTech ${subject_name} ${topic}`);
        resources_links[topic] = {
          youtube: `https://www.youtube.com/results?search_query=${query}`,
          google_notes: `https://www.google.com/search?q=${query}+handwritten+notes+pdf`
        };
      });

      await Exam.addExam({
        user_id,
        subject_name,
        exam_date,
        high_weightage_topics,
        resources_links
      });

      res.redirect('/exams?success=Sessional exam schedule and resource directory logged!');
    } catch (error) {
      console.error('Error logging exam:', error);
      res.redirect('/exams?error=Failed to add exam planner.');
    }
  },

  // Update status of exam preparation
  async postUpdateStatus(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.redirect('/exams?error=Missing status field.');
    }

    try {
      await Exam.updateStatus(id, user_id, status);
      res.redirect('/exams?success=Exam preparation status updated!');
    } catch (error) {
      console.error('Error updating exam status:', error);
      res.redirect('/exams?error=Failed to update preparation status.');
    }
  },

  // Delete an exam schedule
  async postDeleteExam(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;

    try {
      await Exam.deleteExam(id, user_id);
      res.redirect('/exams?success=Exam schedule deleted.');
    } catch (error) {
      console.error('Error deleting exam schedule:', error);
      res.redirect('/exams?error=Failed to delete exam schedule.');
    }
  }
};

module.exports = examController;
