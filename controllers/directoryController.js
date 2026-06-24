const Directory = require('../models/directoryModel');

const directoryController = {
  // Render survival directory page
  async getDirectoryIndex(req, res) {
    const user_id = req.session.user.id;
    try {
      const contacts = await Directory.getAllForUser(user_id);
      res.render('directory', {
        title: 'PG Directory - Student Life OS',
        user: req.session.user,
        contacts,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } catch (error) {
      console.error('Error fetching directory:', error);
      res.render('directory', {
        title: 'PG Directory - Student Life OS',
        user: req.session.user,
        contacts: [],
        error: 'Failed to load contacts directory.',
        success: null
      });
    }
  },

  // Add a new contact
  async postContact(req, res) {
    const user_id = req.session.user.id;
    const { name, service_type, phone, operating_hours, pricing_info, rating } = req.body;

    if (!name || !service_type || !phone) {
      return res.redirect('/directory?error=Missing required contact details.');
    }

    try {
      await Directory.addService({
        user_id,
        name,
        service_type,
        phone,
        operating_hours: operating_hours || '',
        pricing_info: pricing_info || '',
        rating: rating ? parseInt(rating) : 5
      });
      res.redirect('/directory?success=Contact added to survival directory!');
    } catch (error) {
      console.error('Error creating contact:', error);
      res.redirect('/directory?error=Failed to add contact.');
    }
  },

  // Delete a contact
  async deleteContact(req, res) {
    const user_id = req.session.user.id;
    const { id } = req.params;

    try {
      const success = await Directory.deleteService(id, user_id);
      if (success) {
        res.redirect('/directory?success=Contact deleted.');
      } else {
        res.redirect('/directory?error=Contact not found.');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.redirect('/directory?error=Failed to delete contact.');
    }
  }
};

module.exports = directoryController;
