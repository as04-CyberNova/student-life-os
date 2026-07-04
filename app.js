const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// View Engine config (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing and static files middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'student_life_os_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const timeRoutes = require('./routes/timeRoutes');
const choreRoutes = require('./routes/choreRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const academicRoutes = require('./routes/academicRoutes');
const examRoutes = require('./routes/examRoutes');
const { ensureAuth } = require('./middleware/authMiddleware');

// Route bindings
app.use('/auth', authRoutes);
app.use('/budget', budgetRoutes);
app.use('/time', timeRoutes);
app.use('/chores', choreRoutes);
app.use('/directory', directoryRoutes);
app.use('/academics', academicRoutes);
app.use('/exams', examRoutes);
app.use('/', indexRoutes);

// Week 2 & 3 Placeholder Routes (to keep sidebar links functional)
app.get('/complaints', ensureAuth, (req, res) => {
  res.render('complaints', { title: 'Hostel Fix-It - Student Life OS', user: req.session.user });
});
app.get('/meals', ensureAuth, (req, res) => {
  res.render('meals', { title: 'Meal Planner - Student Life OS', user: req.session.user });
});

// Centralized error boundary middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Check terminal logs.');
});

module.exports = app;
