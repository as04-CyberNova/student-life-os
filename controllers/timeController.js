const TimeBudget = require('../models/timeModel');

// Helper to get current week's Monday
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

const timeController = {
  // Render time budget dashboard
  async getTimeIndex(req, res) {
    const user_id = req.session.user.id;
    const selectedWeek = req.query.week || getMonday(new Date());

    try {
      const budgets = await TimeBudget.getWeeklyBudgets(user_id, selectedWeek);

      // Define default categories
      const categories = [
        { id: 'classes', name: 'Lectures / College' },
        { id: 'self_study', name: 'Self Study / Academics' },
        { id: 'coding', name: 'Coding Projects' },
        { id: 'practice_platforms', name: 'DSA / LeetCode Practice' },
        { id: 'chores_errands', name: 'Chores, Laundry & Errands' },
        { id: 'sleep', name: 'Sleep / Rest' },
        { id: 'socializing', name: 'Social / Leisure' }
      ];

      // Map budget rows to categories
      const budgetsMap = {};
      budgets.forEach(row => {
        budgetsMap[row.category] = {
          target: parseFloat(row.target_hours || 0),
          actual: parseFloat(row.actual_hours || 0)
        };
      });

      const formattedBudgets = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        target: budgetsMap[cat.id] ? budgetsMap[cat.id].target : 0.00,
        actual: budgetsMap[cat.id] ? budgetsMap[cat.id].actual : 0.00
      }));

      // Calculate totals
      const totalTarget = formattedBudgets.reduce((acc, curr) => acc + curr.target, 0);
      const totalActual = formattedBudgets.reduce((acc, curr) => acc + curr.actual, 0);

      res.render('time', {
        title: 'Time & Chore Budgeter - Student Life OS',
        user: req.session.user,
        week: selectedWeek,
        budgets: formattedBudgets,
        totalTarget,
        totalActual,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error fetching time budgets:', error);
      res.render('time', {
        title: 'Time & Chore Budgeter - Student Life OS',
        user: req.session.user,
        week: selectedWeek,
        budgets: [],
        totalTarget: 0,
        totalActual: 0,
        error: 'Failed to load time tracker data.',
        success: null
      });
    }
  },

  // Set target hours for categories
  async postSetTargets(req, res) {
    const user_id = req.session.user.id;
    const { week_start_date, targets } = req.body; // targets is object: { category: target_hours }

    if (!week_start_date || !targets) {
      return res.redirect(`/time?error=Invalid setup parameters.`);
    }

    try {
      // Loop over categories and save targets
      for (const [category, hours] of Object.entries(targets)) {
        await TimeBudget.setTarget({
          user_id,
          category,
          target_hours: parseFloat(hours || 0),
          week_start_date
        });
      }

      res.redirect(`/time?week=${week_start_date}&success=Weekly targets configured!`);
    } catch (error) {
      console.error('Error setting targets:', error);
      res.redirect(`/time?week=${week_start_date}&error=Failed to configure targets.`);
    }
  },

  // Log actual hours spent on a category
  async postLogHours(req, res) {
    const user_id = req.session.user.id;
    const { week_start_date, category, hours } = req.body;

    if (!week_start_date || !category || !hours) {
      return res.redirect(`/time?error=Missing details to log hours.`);
    }

    try {
      await TimeBudget.logHours({
        user_id,
        category,
        hours: parseFloat(hours),
        week_start_date
      });

      res.redirect(`/time?week=${week_start_date}&success=Logged ${hours} hours successfully!`);
    } catch (error) {
      console.error('Error logging hours:', error);
      res.redirect(`/time?week=${week_start_date}&error=Failed to log hours.`);
    }
  }
};

module.exports = timeController;
