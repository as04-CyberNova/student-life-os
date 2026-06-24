const Budget = require('../models/budgetModel');

const budgetController = {
  // Render the personal ledger and roommate splits interface
  async getBudgetIndex(req, res) {
    const user_id = req.session.user.id;
    try {
      const transactions = await Budget.getTransactions(user_id);
      const debts = await Budget.getDebts(user_id);
      const balances = await Budget.getRoommateBalances(user_id);
      const summary = await Budget.getMonthlySummary(user_id);

      // Format current month category totals
      const categorySummary = {
        rent_pg: 0,
        mess_food: 0,
        snacks_cravings: 0,
        travel: 0,
        stationery: 0,
        laundry_recharges: 0,
        others: 0
      };

      summary.forEach(row => {
        if (categorySummary[row.category] !== undefined) {
          categorySummary[row.category] = parseFloat(row.total || 0);
        }
      });

      // Calculate total spent this month
      const totalSpentMonth = Object.values(categorySummary).reduce((a, b) => a + b, 0);

      res.render('budget', {
        title: 'Finances & Splits - Student Life OS',
        user: req.session.user,
        transactions,
        debts,
        balances,
        categorySummary,
        totalSpentMonth,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      res.render('budget', {
        title: 'Finances & Splits - Student Life OS',
        user: req.session.user,
        transactions: [],
        debts: [],
        balances: [],
        categorySummary: {},
        totalSpentMonth: 0,
        error: 'Could not load budget data. Please try again.',
        success: null
      });
    }
  },

  // Create a new budget transaction
  async postTransaction(req, res) {
    const user_id = req.session.user.id;
    const { amount, category, type, description, transaction_date } = req.body;

    if (!amount || !category || !transaction_date) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }

    try {
      await Budget.createTransaction({
        user_id,
        amount: parseFloat(amount),
        category,
        type: type || 'expense',
        description: description || '',
        transaction_date
      });

      res.redirect('/budget');
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.redirect('/budget?error=Failed to add transaction.');
    }
  },

  // Delete a transaction
  async deleteTransaction(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;

    try {
      const success = await Budget.deleteTransaction(id, user_id);
      if (success) {
        return res.json({ success: true, message: 'Transaction deleted successfully.' });
      }
      res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  },

  // Log a roommate split
  async postSplitDebt(req, res) {
    const user_id = req.session.user.id;
    const { roommate_name, amount, description, type, transaction_date } = req.body;

    if (!roommate_name || !amount || !description || !transaction_date) {
      return res.redirect('/budget?error=Missing roommate split details.');
    }

    try {
      // Net debt amount:
      // If "roommate_owes_me", the amount is positive (roommate owes user).
      // If "i_owe_roommate", the amount is negative (user owes roommate).
      const finalAmount = type === 'roommate_owes_me' 
        ? parseFloat(amount) 
        : -parseFloat(amount);

      await Budget.createDebt({
        user_id,
        roommate_name: roommate_name.trim(),
        amount: finalAmount,
        description: description.trim(),
        transaction_date
      });

      res.redirect('/budget?success=Roommate bill split added.');
    } catch (error) {
      console.error('Error creating roommate split:', error);
      res.redirect('/budget?error=Failed to add roommate split.');
    }
  },

  // Settle all debts with a specific roommate
  async postSettleDebt(req, res) {
    const user_id = req.session.user.id;
    const { roommate_name } = req.body;

    if (!roommate_name) {
      return res.redirect('/budget?error=Missing roommate name to settle.');
    }

    try {
      await Budget.settleDebtsWithRoommate(user_id, roommate_name);
      res.redirect(`/budget?success=All debts with ${roommate_name} settled!`);
    } catch (error) {
      console.error('Error settling debts:', error);
      res.redirect('/budget?error=Failed to settle roommate debts.');
    }
  }
};

module.exports = budgetController;
