const Chore = require('../models/choreModel');

const choreController = {
  // Render laundry and water can dashboard
  async getChoresIndex(req, res) {
    const user_id = req.session.user.id;
    try {
      const laundryLogs = await Chore.getLaundryLogs(user_id);
      const activeWaterCan = await Chore.getActiveWaterCan(user_id);

      let waterCanStatus = null;
      if (activeWaterCan) {
        const opened = new Date(activeWaterCan.opened_date);
        const expectedEnd = new Date(activeWaterCan.expected_end_date);
        const now = new Date();
        
        // Reset hours for accurate date difference calculation
        opened.setHours(0, 0, 0, 0);
        expectedEnd.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const totalDuration = expectedEnd.getTime() - opened.getTime();
        const elapsed = now.getTime() - opened.getTime();
        
        let percentRemaining = 100;
        if (totalDuration > 0) {
          const fraction = (expectedEnd.getTime() - now.getTime()) / totalDuration;
          percentRemaining = Math.max(0, Math.min(100, Math.round(fraction * 100)));
        } else {
          percentRemaining = 0;
        }

        const daysRemaining = Math.max(0, Math.ceil((expectedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        waterCanStatus = {
          opened_date: activeWaterCan.opened_date,
          expected_end_date: activeWaterCan.expected_end_date,
          percent_remaining: percentRemaining,
          days_remaining: daysRemaining,
          is_low: percentRemaining <= 25
        };
      }

      res.render('chores', {
        title: 'Chore Tracker - Student Life OS',
        user: req.session.user,
        laundryLogs,
        waterCanStatus,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error fetching chores data:', error);
      res.render('chores', {
        title: 'Chore Tracker - Student Life OS',
        user: req.session.user,
        laundryLogs: [],
        waterCanStatus: null,
        error: 'Failed to load chores. Please try again.',
        success: null
      });
    }
  },

  // Create a new laundry log
  async postLaundry(req, res) {
    const user_id = req.session.user.id;
    const { item_count, sent_date, expected_return_date, cost, notes } = req.body;

    if (!item_count || !sent_date || !expected_return_date) {
      return res.redirect('/chores?error=Missing laundry details.');
    }

    try {
      await Chore.createLaundryLog({
        user_id,
        item_count: parseInt(item_count),
        sent_date,
        expected_return_date,
        cost: cost ? parseFloat(cost) : null,
        notes: notes || ''
      });

      res.redirect('/chores?success=Laundry log successfully created!');
    } catch (error) {
      console.error('Error creating laundry log:', error);
      res.redirect('/chores?error=Failed to add laundry log.');
    }
  },

  // Log laundry return
  async postReturnLaundry(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;
    const { actual_return_date, final_cost } = req.body;

    if (!actual_return_date) {
      return res.redirect('/chores?error=Missing return date.');
    }

    try {
      const cost = final_cost ? parseFloat(final_cost) : null;
      await Chore.returnLaundry(id, user_id, actual_return_date, cost);
      res.redirect('/chores?success=Laundry marked as returned!');
    } catch (error) {
      console.error('Error marking laundry return:', error);
      res.redirect('/chores?error=Failed to update laundry status.');
    }
  },

  // Log opening a new water can (resets current tracker)
  async postOpenWaterCan(req, res) {
    const user_id = req.session.user.id;
    const { opened_date, days_to_last } = req.body;

    if (!opened_date || !days_to_last) {
      return res.redirect('/chores?error=Missing opening date or expected days.');
    }

    try {
      const openDateObj = new Date(opened_date);
      const expectedEndDateObj = new Date(openDateObj);
      expectedEndDateObj.setDate(expectedEndDateObj.getDate() + parseInt(days_to_last));

      // Format to YYYY-MM-DD
      const expected_end_date = expectedEndDateObj.toISOString().split('T')[0];

      await Chore.createWaterCanLog({
        user_id,
        opened_date,
        expected_end_date
      });

      res.redirect('/chores?success=New water can opened successfully!');
    } catch (error) {
      console.error('Error opening water can:', error);
      res.redirect('/chores?error=Failed to log new water can.');
    }
  }
};

module.exports = choreController;
