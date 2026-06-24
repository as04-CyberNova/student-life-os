const Academic = require('../models/academicModel');

const academicController = {
  // Render Academics Hub (Explain Concepts & Concept Gaps)
  async getAcademicsHub(req, res) {
    const user_id = req.session.user.id;
    try {
      const concepts = await Academic.getAllConcepts();
      const gaps = await Academic.getConceptGaps(user_id);
      
      // Group concepts by subject for easy browsing
      const subjects = {};
      concepts.forEach(c => {
        if (!subjects[c.subject]) {
          subjects[c.subject] = [];
        }
        subjects[c.subject].push(c);
      });

      res.render('academics/explain-ways', {
        title: 'Academic Hub - Student Life OS',
        user: req.session.user,
        subjects,
        gaps,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error loading Academics Hub:', error);
      res.render('academics/explain-ways', {
        title: 'Academic Hub - Student Life OS',
        user: req.session.user,
        subjects: {},
        gaps: [],
        error: 'Failed to load Academic Hub. Please run database setup.',
        success: null
      });
    }
  },

  // Log a concept as a gap
  async postConceptGap(req, res) {
    const user_id = req.session.user.id;
    const { concept_id } = req.body;

    if (!concept_id) {
      return res.redirect('/academics/explain?error=Missing concept identifier.');
    }

    try {
      await Academic.logConceptGap(user_id, parseInt(concept_id));
      res.redirect('/academics/explain?success=Concept logged in your Gap Detector list.');
    } catch (error) {
      console.error('Error logging concept gap:', error);
      res.redirect('/academics/explain?error=Failed to log concept gap.');
    }
  },

  // Update status of a concept gap (e.g. learning, mastered)
  async postUpdateGapStatus(req, res) {
    const user_id = req.session.user.id;
    const { concept_id, status, quiz_score } = req.body;

    if (!concept_id || !status) {
      return res.redirect('/academics/explain?error=Missing status details.');
    }

    try {
      const score = quiz_score ? parseFloat(quiz_score) : null;
      await Academic.updateConceptGapStatus(user_id, parseInt(concept_id), status, score);
      res.redirect('/academics/explain?success=Concept status updated!');
    } catch (error) {
      console.error('Error updating gap status:', error);
      res.redirect('/academics/explain?error=Failed to update status.');
    }
  },

  // Render Lab to Life Translator
  getLabsTranslator(req, res) {
    // Curated lab mapping list for BTech engineering branches
    const labsList = [
      {
        id: 1,
        branch: 'CSE',
        academic_lab: "Implement Dijkstra's Single Source Shortest Path Algorithm",
        real_world: 'Build a Google Maps Route Optimizer API with visual UI',
        benefit: 'Shows you understand graph algorithms and can optimize routing APIs.',
        milestones: ['Parse network inputs as graph structures', 'Implement min-priority queue Dijkstra', 'Create JSON API response', 'Build HTML5 Canvas path visualizer']
      },
      {
        id: 2,
        branch: 'CSE',
        academic_lab: 'Write a Multi-threaded Producer-Consumer simulation in C/C++',
        real_world: 'Build a Distributed Job Queue Worker system using Node.js & Redis',
        benefit: 'Translates multi-threading/concurrency theory to real backend pub/sub messaging queues.',
        milestones: ['Setup Redis connection pool', 'Build enqueue/dequeue routes', 'Create worker process using BullMQ or cluster module', 'Handle job failures and retries']
      },
      {
        id: 3,
        branch: 'CSE',
        academic_lab: 'SQL Database Normalization & Schema Design Lab',
        real_world: 'Design a highly optimized E-Commerce Database schema on PostgreSQL',
        benefit: 'Demonstrates indexing, scaling, transactions, and performance query tuning.',
        milestones: ['Design normalized schema (3NF)', 'Create indexes on high-frequency tables', 'Simulate heavy transactional read/writes', 'Analyze query plans using EXPLAIN ANALYZE']
      },
      {
        id: 4,
        branch: 'ECE',
        academic_lab: 'Simulate Amplitude Modulation (AM) and Frequency Modulation (FM) in MATLAB',
        real_world: 'Build an Audio Waveform Encoder/Decoder web application in JavaScript',
        benefit: 'Demonstrates signal processing math using modern Web Audio APIs.',
        milestones: ['Capture mic input using Web Audio API', 'Implement mathematical modulation formulas in JS', 'Render waveforms on Canvas', 'Export modulated audio as WAV']
      },
      {
        id: 5,
        branch: 'ECE',
        academic_lab: 'Design a 4-bit Binary Ripple Counter using Logic Gates',
        real_world: 'Build an Interactive Digital Logic Simulator with Canvas drag-and-drop',
        benefit: 'Applies digital electronics logic to interactive software applications.',
        milestones: ['Create logic gate OOP classes (AND, OR, NOT)', 'Build canvas connection logic', 'Implement simulator tick loop', 'Export schema state as JSON']
      }
    ];

    res.render('academics/lab-translator', {
      title: 'Lab to Life Translator - Student Life OS',
      user: req.session.user,
      labsList,
      error: null,
      success: null
    });
  },

  // Render Project Scope Builder
  async getProjectBuilder(req, res) {
    const user_id = req.session.user.id;
    try {
      const savedProjects = await Academic.getProjectScopes(user_id);
      res.render('academics/project-builder', {
        title: 'Project Scope Builder - Student Life OS',
        user: req.session.user,
        savedProjects,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error loading Project Scoper:', error);
      res.render('academics/project-builder', {
        title: 'Project Scope Builder - Student Life OS',
        user: req.session.user,
        savedProjects: [],
        error: 'Failed to load project scoper. Please check database configuration.',
        success: null
      });
    }
  },

  // Create a new project scope (Rule-Based Scoper Wizard)
  async postProjectScope(req, res) {
    const user_id = req.session.user.id;
    const { title, description, tech_stack, difficulty } = req.body;

    if (!title || !tech_stack || !difficulty) {
      return res.redirect('/academics/project-builder?error=Missing required project wizard inputs.');
    }

    try {
      // Rule-based scoper milestone generator
      let milestones = [];
      if (difficulty === 'beginner') {
        milestones = [
          { phase: '1. Setup & Environment', tasks: ['Initialize repository', 'Configure environment variables', 'Draft database schema diagram'] },
          { phase: '2. Database & Basic Models', tasks: ['Setup database connection', 'Define CRUD database schemas', 'Write seed scripts for sample data'] },
          { phase: '3. Core APIs', tasks: ['Build index router', 'Implement basic GET/POST endpoints', 'Test endpoints in Postman'] },
          { phase: '4. Simple Frontend UI', tasks: ['Write semantic HTML templates', 'Add styling using modern CSS variables', 'Connect UI fetch calls to API'] },
          { phase: '5. Verification & Deploy', tasks: ['Verify query logic', 'Deploy to free cloud tier (Render/Railway)', 'Write README setup guide'] }
        ];
      } else if (difficulty === 'intermediate') {
        milestones = [
          { phase: '1. Architecture Design', tasks: ['Draft architectural workflow diagram', 'Setup backend folder structure (MVC)', 'Initialize database and migrations'] },
          { phase: '2. User Security & Auth', tasks: ['Implement password hashing (Bcrypt)', 'Configure express session cookie storage', 'Add Auth check middlewares'] },
          { phase: '3. Business Logic APIs', tasks: ['Develop relational data APIs', 'Setup file uploads using Multer', 'Write query helper functions'] },
          { phase: '4. Responsive Glassmorphic UI', tasks: ['Build layout wrapper components', 'Implement grid layout modules', 'Write client-side validation logic'] },
          { phase: '5. Testing & Cloud Hosting', tasks: ['Perform SQL injection security checks', 'Perform manual endpoints walkthrough', 'Configure deployment environment and run live tests'] }
        ];
      } else {
        // Advanced
        milestones = [
          { phase: '1. Full Stack Architecture', tasks: ['Design relational schema with optimization triggers', 'Configure monorepo or strict backend service layout', 'Configure Redis caching layers'] },
          { phase: '2. Real-Time Logic & Security', tasks: ['Configure WebSockets or asynchronous pub/sub queuing', 'Implement comprehensive input schema validation', 'Add rate-limiting controls'] },
          { phase: '3. Highly Optimized APIs', tasks: ['Write relational queries with joins and subqueries', 'Implement transaction handling controls', 'Benchmark query durations'] },
          { phase: '4. Premium Client Frontend', tasks: ['Build interactive dashboard UI controls', 'Integrate analytical chart dashboards (Chart.js)', 'Implement fluid CSS transitions'] },
          { phase: '5. Production Orchestration', tasks: ['Orchestrate docker configuration files', 'Setup auto-backups and monitoring logs', 'Deploy cluster instances'] }
        ];
      }

      await Academic.addProjectScope({
        user_id,
        title,
        description: description || '',
        tech_stack,
        difficulty,
        milestones
      });

      res.redirect('/academics/project-builder?success=Project scope roadmap successfully generated!');
    } catch (error) {
      console.error('Error generating project scope:', error);
      res.redirect('/academics/project-builder?error=Failed to generate project scope.');
    }
  },

  // Delete a project scope
  async deleteProjectScope(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;

    try {
      const success = await Academic.deleteProjectScope(id, user_id);
      if (success) {
        res.redirect('/academics/project-builder?success=Project scope deleted.');
      } else {
        res.redirect('/academics/project-builder?error=Project scope not found.');
      }
    } catch (error) {
      console.error('Error deleting project scope:', error);
      res.redirect('/academics/project-builder?error=Failed to delete scope.');
    }
  }
};

module.exports = academicController;
