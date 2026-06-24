const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const authController = {
  // Render register page
  getRegister(req, res) {
    res.render('auth/register', { title: 'Register - Student Life OS', error: null, success: null });
  },

  // Handle registration
  async postRegister(req, res) {
    const { name, email, password, confirmPassword, college, branch, year_of_study } = req.body;

    if (!name || !email || !password) {
      return res.render('auth/register', { 
        title: 'Register - Student Life OS', 
        error: 'Please fill all required fields.', 
        success: null 
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', { 
        title: 'Register - Student Life OS', 
        error: 'Passwords do not match.', 
        success: null 
      });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.render('auth/register', { 
          title: 'Register - Student Life OS', 
          error: 'Email already registered. Please login.', 
          success: null 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      await User.create({
        name,
        email,
        password: hashedPassword,
        college: college || null,
        branch: branch || null,
        year_of_study: year_of_study ? parseInt(year_of_study) : null
      });

      res.render('auth/login', { 
        title: 'Login - Student Life OS', 
        error: null, 
        success: 'Registration successful! Please login.' 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.render('auth/register', { 
        title: 'Register - Student Life OS', 
        error: 'Database error occurred. Please try again.', 
        success: null 
      });
    }
  },

  // Render login page
  getLogin(req, res) {
    res.render('auth/login', { title: 'Login - Student Life OS', error: null, success: null });
  },

  // Handle login
  async postLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', { 
        title: 'Login - Student Life OS', 
        error: 'Please enter email and password.', 
        success: null 
      });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.render('auth/login', { 
          title: 'Login - Student Life OS', 
          error: 'Invalid email or password.', 
          success: null 
        });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('auth/login', { 
          title: 'Login - Student Life OS', 
          error: 'Invalid email or password.', 
          success: null 
        });
      }

      // Create session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        branch: user.branch,
        year_of_study: user.year_of_study
      };

      res.redirect('/');
    } catch (error) {
      console.error('Login error:', error);
      res.render('auth/login', { 
        title: 'Login - Student Life OS', 
        error: 'An error occurred. Please try again.', 
        success: null 
      });
    }
  },

  // Handle logout
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout session destroy error:', err);
      }
      res.redirect('/auth/login');
    });
  }
};

module.exports = authController;
