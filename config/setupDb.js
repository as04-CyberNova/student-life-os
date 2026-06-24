const mysql = require('mysql2/promise');
require('dotenv').config();

const tablesSql = [
  // 1. Users Table
  `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      college VARCHAR(255),
      branch VARCHAR(100),
      year_of_study INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // 2. Budget Transactions Table
  `CREATE TABLE IF NOT EXISTS budget_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category ENUM('rent_pg', 'mess_food', 'snacks_cravings', 'travel', 'stationery', 'laundry_recharges', 'others') NOT NULL,
      type ENUM('expense', 'income') DEFAULT 'expense',
      description VARCHAR(255),
      transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 3. Roommate Debts Table
  `CREATE TABLE IF NOT EXISTS roommate_debts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      roommate_name VARCHAR(100) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description VARCHAR(255) NOT NULL,
      status ENUM('pending', 'settled') DEFAULT 'pending',
      transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 4. Laundry Logs Table
  `CREATE TABLE IF NOT EXISTS laundry_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_count INT NOT NULL,
      sent_date DATE NOT NULL,
      expected_return_date DATE NOT NULL,
      actual_return_date DATE,
      cost DECIMAL(8, 2),
      status ENUM('with_dhobi', 'returned') DEFAULT 'with_dhobi',
      notes VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 5. Water Can Logs Table
  `CREATE TABLE IF NOT EXISTS water_can_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      opened_date DATE NOT NULL,
      expected_end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 6. Local Survival Directory
  `CREATE TABLE IF NOT EXISTS survival_directory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      service_type ENUM('dhobi', 'water_delivery', 'night_food', 'landlord', 'warden', 'pharmacy', 'tapri_tea', 'others') NOT NULL,
      phone VARCHAR(20) NOT NULL,
      operating_hours VARCHAR(100),
      pricing_info VARCHAR(255),
      rating INT DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 7. Mess Menu Table
  `CREATE TABLE IF NOT EXISTS mess_menu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
      meal_type ENUM('breakfast', 'lunch', 'snacks', 'dinner') NOT NULL,
      food_items TEXT NOT NULL,
      user_rating INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_day_meal (user_id, day_of_week, meal_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 8. Time Budgets Table
  `CREATE TABLE IF NOT EXISTS time_budgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      category ENUM('classes', 'self_study', 'coding', 'practice_platforms', 'chores_errands', 'sleep', 'socializing') NOT NULL,
      target_hours DECIMAL(4, 2) NOT NULL,
      actual_hours DECIMAL(4, 2) DEFAULT 0.00,
      week_start_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_cat_week (user_id, category, week_start_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 9. Resume Points Table
  `CREATE TABLE IF NOT EXISTS resume_points (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      bullet_point TEXT NOT NULL,
      score INT NOT NULL,
      has_metrics BOOLEAN DEFAULT FALSE,
      has_action_verbs BOOLEAN DEFAULT FALSE,
      has_links BOOLEAN DEFAULT FALSE,
      suggestions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 10. Project Scopes Table
  `CREATE TABLE IF NOT EXISTS project_scopes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      tech_stack VARCHAR(255) NOT NULL,
      difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
      milestones JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 11. Curated Concepts Table
  `CREATE TABLE IF NOT EXISTS curated_concepts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(100) NOT NULL,
      topic VARCHAR(150) UNIQUE NOT NULL,
      simple_explanation TEXT NOT NULL,
      technical_explanation TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 12. Concept Gaps Table
  `CREATE TABLE IF NOT EXISTS concept_gaps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      concept_id INT NOT NULL,
      status ENUM('identified', 'learning', 'mastered') DEFAULT 'identified',
      quiz_score DECIMAL(5, 2),
      last_tested TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (concept_id) REFERENCES curated_concepts(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_concept (user_id, concept_id)
  )`,

  // 13. Exam Planner Table
  `CREATE TABLE IF NOT EXISTS exam_planner (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      subject_name VARCHAR(150) NOT NULL,
      exam_date DATE NOT NULL,
      high_weightage_topics TEXT NOT NULL,
      resources_links JSON NOT NULL,
      preparation_status ENUM('not_started', 'in_progress', 'ready') DEFAULT 'not_started',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 14. Interview Mistakes Table
  `CREATE TABLE IF NOT EXISTS interview_mistakes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      company_name VARCHAR(150),
      mistake_description TEXT NOT NULL,
      category ENUM('dsa', 'dbms', 'os', 'networks', 'system_design', 'behavioral') NOT NULL,
      correct_solution TEXT,
      tags VARCHAR(255),
      logged_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // 15. Meal Recipes Table
  `CREATE TABLE IF NOT EXISTS meal_recipes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      cost DECIMAL(8, 2) NOT NULL,
      calories INT,
      cooking_time_mins INT,
      ingredients TEXT NOT NULL,
      recipe_link VARCHAR(255),
      cooking_method ENUM('kettle_only', 'induction_friendly', 'no_cook', 'mess_hack') NOT NULL,
      tags VARCHAR(100)
  )`
];

async function runSetup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  });

  try {
    const dbName = process.env.DB_NAME || 'student_life_os';
    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log("Creating tables...");
    for (const sql of tablesSql) {
      // Find table name for logging
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
      const tableName = match ? match[1] : "unknown";
      process.stdout.write(`Creating table ${tableName}... `);
      await connection.query(sql);
      console.log("OK");
    }

    console.log("\nDatabase setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSetup();
}

module.exports = runSetup;
