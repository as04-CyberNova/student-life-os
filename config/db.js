const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to store mock data if MySQL is offline
const MOCK_DB_PATH = process.env.MOCK_DB_PATH || path.join(__dirname, 'mockDb.json');

// Helper to load/save mock database
function loadMockDb() {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_DB_PATH)) {
    // Seed default database structures
    const defaultDb = {
      users: [],
      budget_transactions: [],
      roommate_debts: [],
      laundry_logs: [],
      water_can_logs: [],
      survival_directory: [],
      mess_menu: [],
      time_budgets: [],
      resume_points: [],
      project_scopes: [],
      curated_concepts: [
        {
          id: 1,
          subject: 'Operating Systems',
          topic: 'Virtual Memory',
          simple_explanation: 'Imagine your computer is a desk. The physical RAM is the space on top of the desk where you keep books you are currently reading. Virtual memory is a bookshelf in the corner. If you run out of desk space, you temporarily move books you aren\'t reading right now to the bookshelf, and bring them back when you need them.',
          technical_explanation: 'Virtual Memory is a memory management capability that provides an idealized abstraction of the storage resources that are actually available. It maps virtual addresses used by a program into physical addresses in computer memory (RAM) or swap space on disk, using paging and page tables to isolate process address spaces.'
        },
        {
          id: 2,
          subject: 'Operating Systems',
          topic: 'CPU Scheduling',
          simple_explanation: 'Think of CPU Scheduling like a single cashier at a busy billing counter in a supermarket. The cashier has to decide who gets served next: is it the person who got in line first (FCFS), the person with the fewest items (Shortest Job First), or does everyone get 1 minute of service in a circle (Round Robin)?',
          technical_explanation: 'CPU Scheduling is the process by which the operating system allocates CPU execution time to competing processes. Algorithms like First-Come First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin (RR) optimize metrics like throughput, turnaround time, waiting time, and response time.'
        },
        {
          id: 3,
          subject: 'DBMS',
          topic: 'Database Normalization',
          simple_explanation: 'Normalization is like organizing your wardrobe. Instead of throwing shirts, socks, and shoes into one giant messy box (which leads to duplicate socks and lost shoes), you put shirts in the hanger rack, socks in the drawer, and shoes on the rack. You link them by tags so they stay organized with no clutter.',
          technical_explanation: 'Database Normalization is a systematic approach of decomposing tables to eliminate data redundancy (duplication) and undesirable characteristics like Insertion, Update, and Deletion Anomalies. It divides large tables into smaller ones and defines relationships between them to satisfy Normal Forms (1NF, 2NF, 3NF, BCNF).'
        }
      ],
      concept_gaps: [],
      exam_planner: [],
      interview_mistakes: [],
      meal_recipes: []
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveMockDb(data) {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// SQL parser to simulate db actions in-memory
async function executeMockQuery(sql, params) {
  const db = loadMockDb();
  const sqlNormalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
  
  const genId = (table) => {
    return db[table].length > 0 ? Math.max(...db[table].map(x => x.id)) + 1 : 1;
  };

  // --- USERS TABLE ---
  if (sqlNormalized.startsWith('select * from users where email =') || sqlNormalized.includes('from users where email =')) {
    const user = db.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return [user ? [user] : []];
  }
  if (sqlNormalized.includes('from users where id =')) {
    const user = db.users.find(u => u.id === parseInt(params[0]));
    return [user ? [user] : []];
  }
  if (sqlNormalized.startsWith('insert into users')) {
    const newId = genId('users');
    const newUser = {
      id: newId,
      name: params[0],
      email: params[1],
      password: params[2],
      college: params[3],
      branch: params[4],
      year_of_study: parseInt(params[5]),
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveMockDb(db);
    return [{ insertId: newId }];
  }

  // --- BUDGET TRANSACTIONS ---
  if (sqlNormalized.startsWith('insert into budget_transactions')) {
    const newId = genId('budget_transactions');
    db.budget_transactions.push({
      id: newId,
      user_id: parseInt(params[0]),
      amount: parseFloat(params[1]),
      category: params[2],
      type: params[3],
      description: params[4],
      transaction_date: params[5],
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('select * from budget_transactions where user_id =')) {
    const rows = db.budget_transactions
      .filter(t => t.user_id === parseInt(params[0]))
      .sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date) || b.id - a.id);
    return [rows];
  }

  // --- ROOMMATE DEBTS ---
  if (sqlNormalized.startsWith('insert into roommate_debts')) {
    const newId = genId('roommate_debts');
    db.roommate_debts.push({
      id: newId,
      user_id: parseInt(params[0]),
      roommate_name: params[1],
      amount: parseFloat(params[2]),
      description: params[3],
      status: params[4] || 'pending',
      transaction_date: params[5],
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('select * from roommate_debts where user_id =')) {
    const rows = db.roommate_debts
      .filter(d => d.user_id === parseInt(params[0]))
      .sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date) || b.id - a.id);
    return [rows];
  }
  if (sqlNormalized.startsWith('update roommate_debts set status =')) {
    const id = parseInt(params[1]);
    const userId = parseInt(params[2]);
    const item = db.roommate_debts.find(d => d.id === id && d.user_id === userId);
    if (item) {
      item.status = params[0];
      saveMockDb(db);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // --- LAUNDRY LOGS ---
  if (sqlNormalized.startsWith('insert into laundry_logs')) {
    const newId = genId('laundry_logs');
    db.laundry_logs.push({
      id: newId,
      user_id: parseInt(params[0]),
      item_count: parseInt(params[1]),
      sent_date: params[2],
      expected_return_date: params[3],
      cost: params[4] ? parseFloat(params[4]) : null,
      notes: params[5],
      status: 'with_dhobi',
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('select * from laundry_logs where user_id =')) {
    const rows = db.laundry_logs
      .filter(l => l.user_id === parseInt(params[0]))
      .sort((a,b) => new Date(b.sent_date) - new Date(a.sent_date) || b.id - a.id);
    return [rows];
  }
  if (sqlNormalized.startsWith('update laundry_logs set status =')) {
    const actual_return_date = params[0];
    const cost = params[1] ? parseFloat(params[1]) : null;
    const id = parseInt(params[2]);
    const userId = parseInt(params[3]);
    const item = db.laundry_logs.find(l => l.id === id && l.user_id === userId);
    if (item) {
      item.status = 'returned';
      item.actual_return_date = actual_return_date;
      item.cost = cost;
      saveMockDb(db);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // --- WATER CAN LOGS ---
  if (sqlNormalized.startsWith('update water_can_logs set is_active =')) {
    db.water_can_logs.forEach(w => {
      if (w.user_id === parseInt(params[0])) w.is_active = false;
    });
    saveMockDb(db);
    return [{ affectedRows: 1 }];
  }
  if (sqlNormalized.startsWith('insert into water_can_logs')) {
    const newId = genId('water_can_logs');
    db.water_can_logs.push({
      id: newId,
      user_id: parseInt(params[0]),
      opened_date: params[1],
      expected_end_date: params[2],
      is_active: true,
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('select * from water_can_logs where user_id =')) {
    const item = db.water_can_logs.find(w => w.user_id === parseInt(params[0]) && w.is_active);
    return [item ? [item] : []];
  }

  // --- SURVIVAL DIRECTORY ---
  if (sqlNormalized.startsWith('select * from survival_directory where user_id =')) {
    const rows = db.survival_directory
      .filter(s => s.user_id === parseInt(params[0]))
      .sort((a,b) => b.rating - a.rating || a.name.localeCompare(b.name));
    return [rows];
  }
  if (sqlNormalized.startsWith('insert into survival_directory')) {
    const newId = genId('survival_directory');
    db.survival_directory.push({
      id: newId,
      user_id: parseInt(params[0]),
      name: params[1],
      service_type: params[2],
      phone: params[3],
      operating_hours: params[4],
      pricing_info: params[5],
      rating: parseInt(params[6]),
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('delete from survival_directory where id =')) {
    const id = parseInt(params[0]);
    const userId = parseInt(params[1]);
    const initialLength = db.survival_directory.length;
    db.survival_directory = db.survival_directory.filter(s => !(s.id === id && s.user_id === userId));
    saveMockDb(db);
    return [{ affectedRows: initialLength - db.survival_directory.length }];
  }

  // --- TIME BUDGETS ---
  if (sqlNormalized.startsWith('select * from time_budgets where user_id =')) {
    const userId = parseInt(params[0]);
    const weekStart = params[1];
    const rows = db.time_budgets.filter(t => t.user_id === userId && t.week_start_date === weekStart);
    return [rows];
  }
  if (sqlNormalized.includes('insert into time_budgets') && sqlNormalized.includes('actual_hours = actual_hours +')) {
    const userId = parseInt(params[0]);
    const category = params[1];
    const hours = parseFloat(params[2]);
    const weekStart = params[3];
    const addedHours = parseFloat(params[4]);
    
    let budget = db.time_budgets.find(t => t.user_id === userId && t.category === category && t.week_start_date === weekStart);
    if (!budget) {
      const newId = genId('time_budgets');
      budget = {
        id: newId,
        user_id: userId,
        category,
        target_hours: 0.00,
        actual_hours: hours,
        week_start_date: weekStart,
        created_at: new Date().toISOString()
      };
      db.time_budgets.push(budget);
    } else {
      budget.actual_hours = parseFloat(budget.actual_hours) + addedHours;
    }
    saveMockDb(db);
    return [{ affectedRows: 1 }];
  }
  if (sqlNormalized.includes('insert into time_budgets') && sqlNormalized.includes('target_hours =')) {
    const userId = parseInt(params[0]);
    const category = params[1];
    const target = parseFloat(params[2]);
    const weekStart = params[3];
    const updateTarget = parseFloat(params[4]);
    
    let budget = db.time_budgets.find(t => t.user_id === userId && t.category === category && t.week_start_date === weekStart);
    if (!budget) {
      const newId = genId('time_budgets');
      budget = {
        id: newId,
        user_id: userId,
        category,
        target_hours: target,
        actual_hours: 0.00,
        week_start_date: weekStart,
        created_at: new Date().toISOString()
      };
      db.time_budgets.push(budget);
    } else {
      budget.target_hours = updateTarget;
    }
    saveMockDb(db);
    return [{ affectedRows: 1 }];
  }

  // --- CURATED CONCEPTS ---
  if (sqlNormalized.startsWith('select * from curated_concepts')) {
    return [db.curated_concepts];
  }

  // --- CONCEPT GAPS ---
  if (sqlNormalized.includes('join curated_concepts')) {
    const userId = parseInt(params[0]);
    const gaps = db.concept_gaps.filter(g => g.user_id === userId);
    const joined = gaps.map(g => {
      const cc = db.curated_concepts.find(c => c.id === g.concept_id) || {};
      return { ...g, ...cc };
    });
    return [joined];
  }
  if (sqlNormalized.startsWith('insert into concept_gaps')) {
    const userId = parseInt(params[0]);
    const conceptId = parseInt(params[1]);
    let gap = db.concept_gaps.find(g => g.user_id === userId && g.concept_id === conceptId);
    if (!gap) {
      const newId = genId('concept_gaps');
      gap = {
        id: newId,
        user_id: userId,
        concept_id: conceptId,
        status: 'identified',
        quiz_score: null,
        last_tested: new Date().toISOString()
      };
      db.concept_gaps.push(gap);
    } else {
      gap.status = 'identified';
    }
    saveMockDb(db);
    return [{ affectedRows: 1 }];
  }
  if (sqlNormalized.startsWith('update concept_gaps')) {
    const status = params[0];
    const quiz_score = params[1] !== null ? parseFloat(params[1]) : null;
    const userId = parseInt(params[2]);
    const conceptId = parseInt(params[3]);
    const gap = db.concept_gaps.find(g => g.user_id === userId && g.concept_id === conceptId);
    if (gap) {
      gap.status = status;
      gap.quiz_score = quiz_score;
      gap.last_tested = new Date().toISOString();
      saveMockDb(db);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // --- PROJECT SCOPES ---
  if (sqlNormalized.startsWith('select * from project_scopes where user_id =')) {
    const rows = db.project_scopes
      .filter(p => p.user_id === parseInt(params[0]))
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows];
  }
  if (sqlNormalized.startsWith('insert into project_scopes')) {
    const newId = genId('project_scopes');
    db.project_scopes.push({
      id: newId,
      user_id: parseInt(params[0]),
      title: params[1],
      description: params[2],
      tech_stack: params[3],
      difficulty: params[4],
      milestones: typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5],
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('delete from project_scopes where id =')) {
    const id = parseInt(params[0]);
    const userId = parseInt(params[1]);
    const initialLength = db.project_scopes.length;
    db.project_scopes = db.project_scopes.filter(p => !(p.id === id && p.user_id === userId));
    saveMockDb(db);
    return [{ affectedRows: initialLength - db.project_scopes.length }];
  }

  // --- EXAMS ---
  if (sqlNormalized.startsWith('select * from exam_planner where user_id =')) {
    const rows = db.exam_planner
      .filter(e => e.user_id === parseInt(params[0]))
      .sort((a,b) => new Date(a.exam_date) - new Date(b.exam_date));
    return [rows];
  }
  if (sqlNormalized.startsWith('insert into exam_planner')) {
    const newId = genId('exam_planner');
    db.exam_planner.push({
      id: newId,
      user_id: parseInt(params[0]),
      subject_name: params[1],
      exam_date: params[2],
      high_weightage_topics: params[3],
      resources_links: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
      preparation_status: 'not_started',
      created_at: new Date().toISOString()
    });
    saveMockDb(db);
    return [{ insertId: newId }];
  }
  if (sqlNormalized.startsWith('update exam_planner set preparation_status =')) {
    const status = params[0];
    const id = parseInt(params[1]);
    const userId = parseInt(params[2]);
    const item = db.exam_planner.find(e => e.id === id && e.user_id === userId);
    if (item) {
      item.preparation_status = status;
      saveMockDb(db);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }
  if (sqlNormalized.startsWith('delete from exam_planner where id =')) {
    const id = parseInt(params[0]);
    const userId = parseInt(params[1]);
    const initialLength = db.exam_planner.length;
    db.exam_planner = db.exam_planner.filter(e => !(e.id === id && e.user_id === userId));
    saveMockDb(db);
    return [{ affectedRows: initialLength - db.exam_planner.length }];
  }

  // Fallback default response
  return [[]];
}

let useMock = false;

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'student_life_os',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.query('SELECT 1').then(() => {
  console.log("Connected to MySQL successfully!");
}).catch(err => {
  console.warn("⚠️ MySQL is offline or refused connection. Falling back to local Mock database.");
  useMock = true;
});

const dbWrapper = {
  async query(sql, params) {
    if (useMock) {
      return executeMockQuery(sql, params);
    }
    try {
      return await pool.query(sql, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_DB_ERROR') {
        console.warn("⚠️ MySQL error (" + err.code + "). Falling back to local Mock database.");
        useMock = true;
        return executeMockQuery(sql, params);
      }
      throw err;
    }
  },
  
  async getConnection() {
    if (useMock) {
      return {
        query: this.query.bind(this),
        release: () => {}
      };
    }
    return await pool.getConnection();
  },
  
  end() {
    return pool.end();
  }
};

module.exports = dbWrapper;
