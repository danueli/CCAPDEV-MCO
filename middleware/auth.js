// Redirect to login if no active session
exports.requireLogin = (req, res, next) => {
    // Prevent browser from caching protected pages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (!req.session.userId) return res.redirect('/login');
    next();
};

// Redirect to main if not an admin
exports.requireAdmin = (req, res, next) => {
    // Prevent browser from caching protected pages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    if (!req.session.userId) return res.redirect('/login');
    if (req.session.role !== 'admin') return res.status(403).send('Forbidden');
    next();
};