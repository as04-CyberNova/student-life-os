const Budget = require('../models/budgetModel');
const Chore = require('../models/choreModel');
const TimeBudget = require('../models/timeModel');

// Helper to get current week's Monday
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

const indexController = {
  async getDashboard(req, res) {
    const user_id = req.session.user.id;
    const currentWeek = getMonday(new Date());

    try {
      // 1. Get Monthly Budget Spent
      const budgetSummary = await Budget.getMonthlySummary(user_id);
      let monthlySpent = 0;
      budgetSummary.forEach(row => {
        monthlySpent += parseFloat(row.total || 0);
      });

      // 2. Get Roommate Splitting Debts
      const balances = await Budget.getRoommateBalances(user_id);
      let netOwed = 0;
      balances.forEach(b => {
        netOwed += parseFloat(b.net_balance);
      });

      // 3. Get Time Tracking for Current Week
      const timeBudgets = await TimeBudget.getWeeklyBudgets(user_id, currentWeek);
      let totalTarget = 0;
      let totalActual = 0;
      timeBudgets.forEach(b => {
        totalTarget += parseFloat(b.target_hours || 0);
        totalActual += parseFloat(b.actual_hours || 0);
      });

      // 4. Get Laundry Active Logs Count
      const laundryLogs = await Chore.getLaundryLogs(user_id);
      const activeLaundry = laundryLogs.filter(log => log.status === 'with_dhobi').length;

      // 5. Get Active Water Can Status
      const activeWaterCan = await Chore.getActiveWaterCan(user_id);
      let waterRemaining = null;
      if (activeWaterCan) {
        const expectedEnd = new Date(activeWaterCan.expected_end_date);
        const opened = new Date(activeWaterCan.opened_date);
        const now = new Date();
        
        opened.setHours(0, 0, 0, 0);
        expectedEnd.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const total = expectedEnd.getTime() - opened.getTime();
        if (total > 0) {
          const frac = (expectedEnd.getTime() - now.getTime()) / total;
          waterRemaining = Math.max(0, Math.min(100, Math.round(frac * 100)));
        } else {
          waterRemaining = 0;
        }
      }

      res.render('index', {
        title: 'Dashboard - Student Life OS',
        user: req.session.user,
        monthlySpent,
        netOwed,
        totalTarget,
        totalActual,
        activeLaundry,
        waterRemaining,
        error: null
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      res.render('index', {
        title: 'Dashboard - Student Life OS',
        user: req.session.user,
        monthlySpent: 0,
        netOwed: 0,
        totalTarget: 0,
        totalActual: 0,
        activeLaundry: 0,
        waterRemaining: null,
        error: 'Failed to aggregate dashboard metrics. Please reload.'
      });
    }
  }
};

module.exports = indexController;
