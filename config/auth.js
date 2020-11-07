const auth = {}

auth.isStudentLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType === "STUDENT") return next();
    req.flash('error_msgs', 'Please log in to access this page');
    res.redirect('/student/login');
};

auth.isUserLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.userType === "STUDENT" || req.user.userType === "ADMIN")) return next();
    req.flash('error_msgs', 'Please log in to access this page');
    res.redirect('/student/login');
};

auth.isAdminLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType == "ADMIN") return next();
    req.flash('error_msgs', 'Only admins can access this page');
    res.redirect('/admin/login');
};

module.exports = auth;