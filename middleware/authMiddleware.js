module.exports = {
  // Ensure user is authenticated
  ensureAuth(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    
    // Check if it's an AJAX/API request
    if (req.xhr || req.path.startsWith('/api/') || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }
    
    // Redirect to login page for page requests
    res.redirect('/auth/login');
  },

  // Ensure user is guest (not logged in) - e.g. for login/register pages
  ensureGuest(req, res, next) {
    if (req.session && req.session.user) {
      return res.redirect('/');
    }
    next();
  }
};
