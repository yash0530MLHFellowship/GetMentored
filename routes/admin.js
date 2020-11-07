const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const auth = require('../config/auth');
const { secretNumber } = require('../config/constants');

// importing models
const Admin = require('../models/admin');
const Student = require('../models/student');
const Community = require("../models/community");
const CV_Builder = require("../models/cv_builder");
const InternshipOpportunity = require("../models/internship_opportunity");
const Internship = require("../models/internship");
const Mentor = require('../models/mentor');
const Mentorship = require("../models/mentorship");
const VolunteershipOpportunity = require("../models/volunteership_opportunity");
const Volunteership = require("../models/volunteership");

const router = express.Router();

// home routes
router.get("/home", auth.isAdminLoggedIn, (req, res) => {
    res.redirect("/admin/home/students");
});
router.get("/home/cv", auth.isAdminLoggedIn, (req, res) => {
    CV_Builder.find({}, null, { sort: { created: -1 } }, (err, cvs) => {
        if (err) console.log(err);
        res.render("admin/home/cv", {
            cvs
        });
    });
});
router.get("/home/community", auth.isAdminLoggedIn, (req, res) => {
    Community.find({}, null, { sort: { created: -1 } }, (err, posts) => {
        if (err) console.log(err);
        res.render("admin/home/community", {
            posts
        });
    });
});
router.get("/home/internships", auth.isAdminLoggedIn, (req, res) => {
    Internship.find({}, null, { sort: { created: -1 } }, (err, internships) => {
        if (err) console.log(err);
        res.render("admin/home/internships", {
            internships
        });
    });
});
router.get("/home/internship_opportunities", auth.isAdminLoggedIn, (req, res) => {
    InternshipOpportunity.find({}, null, { sort: { created: -1 } }, (err, internship_opportunities) => {
        if (err) console.log(err);
        res.render("admin/home/internship_opportunities", {
            internship_opportunities
        });
    });
});
router.get("/home/mentors", auth.isAdminLoggedIn, (req, res) => {
    Mentor.find({}, null, { sort: { created: -1 } }, (err, mentors) => {
        if (err) console.log(err);
        res.render("admin/home/mentors", {
            mentors
        });
    });
});
router.get("/home/mentorships", auth.isAdminLoggedIn, (req, res) => {
    Mentorship.find({}, null, { sort: { created: -1 } }, (err, mentorships) => {
        if (err) console.log(err);
        res.render("admin/home/mentorships", {
            mentorships
        });
    });
});
router.get("/home/students", auth.isAdminLoggedIn, (req, res) => {
    Student.find({}, null, { sort: { created: -1 } }, (err, students) => {
        if (err) console.log(err);
        res.render("admin/home/students", {
            students
        });
    });
});
router.get("/home/volunteerships", auth.isAdminLoggedIn, (req, res) => {
    Volunteership.find({}, null, { sort: { created: -1 } }, (err, volunteerships) => {
        if (err) console.log(err);
        res.render("admin/home/volunteerships", {
            volunteerships
        });
    });
});
router.get("/home/volunteership_opportunities", auth.isAdminLoggedIn, (req, res) => {
    VolunteershipOpportunity.find({}, null, { sort: { created: -1 } }, (err, volunteership_opportunities) => {
        if (err) console.log(err);
        res.render("admin/home/volunteership_opportunities", {
            volunteership_opportunities
        });
    });
});

// login routes
router.get("/login", (req, res) => {
    if (req.isAuthenticated() && req.user.userType === "ADMIN")
        res.redirect("/admin/home");
    else
        res.render("admin/login");
});

router.post('/login', (req, res, next) => {
    passport.authenticate('admin-local', {
        successRedirect: '/admin/home',
        failureRedirect: '/admin/login',
        failureFlash: 'Invalid username or password'
    })(req, res, next);
});

// register routes
router.get("/register", auth.isAdminLoggedIn, (req, res) => {
    res.render("admin/register");
});

router.post("/register", auth.isAdminLoggedIn, (req, res) => {
    const { name, email, password1, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password1 || !password2) {
        errors.push('Please fill in all required fields');
    }
    if (password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if (password1.length < 8) {
        errors.push('Password should be at least 8 characters long');
    }
    if (errors.length > 0) {
        res.render("admin/register", { errors, name, email, password1, password2 });
    } else {
        Admin.findOne({ email })
            .then(admin => {
                if (admin) {
                    errors.push('This email has already been registered');
                    res.render("admin/register", { errors, name, email, password1, password2 });
                } else {
                    const newAdmin = new Admin({ name, email, password: password1 });
                    bcrypt.genSalt(secretNumber, (err, salt) => {
                        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                            if (err) { throw err; }
                            newAdmin.password = hash;
                            newAdmin.save()
                                .then(admin => {
                                    req.flash('success_msgs', 'Successfully registered!');
                                    res.redirect('/admin/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
    };
});

// logout route
router.get("/logout", auth.isAdminLoggedIn, (req, res) => {
    req.logout();
    req.flash('success_msgs', 'Successfully logged out');
    res.redirect('/admin/login')
});

// change the mentorship status
router.get("/accept/mentorship/:mentorship/:status_num", auth.isAdminLoggedIn, (req, res) => {
    Mentorship.findByIdAndUpdate(req.params.mentorship, { status: Number(req.params.status_num) }, (err, mentorship) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else res.redirect("back");
    });
});

// change the cv status
router.get("/accept/cv/:cv/:status_num", auth.isAdminLoggedIn, (req, res) => {
    CV_Builder.findByIdAndUpdate(req.params.cv, { status: Number(req.params.status_num) }, (err, cv) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else res.redirect("back");
    });
});

// change the internship status
router.get("/accept/internship/:internship/:status_num", auth.isAdminLoggedIn, (req, res) => {
    Internship.findByIdAndUpdate(req.params.internship, { status: Number(req.params.status_num) }, (err, internship) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            InternshipOpportunity.findOne({ _id: internship.internship_opportunity.id })
                .then(internship_opportunity => {
                    if (internship_opportunity) {
                        internship_opportunity.openings_left -= 1;
                        internship_opportunity.save(function (err) { });
                    } else { }
                });
            res.redirect("back");
        }
    });
});

// change the volunteership status
router.get("/accept/volunteership/:volunteership/:status_num", auth.isAdminLoggedIn, (req, res) => {
    Volunteership.findByIdAndUpdate(req.params.volunteership, { status: Number(req.params.status_num) }, (err, volunteership) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            VolunteershipOpportunity.findOne({ _id: volunteership.volunteership_opportunity.id })
                .then(volunteership_opportunity => {
                    if (volunteership_opportunity) {
                        volunteership_opportunity.openings_left -= 1;
                        volunteership_opportunity.save(function (err) { });
                    } else { }
                });
            res.redirect("back");
        }
    });
});

// accept post
router.get("/accept/community/:id", auth.isAdminLoggedIn, (req, res) => {
    Community.findByIdAndUpdate(req.params.id, { status: true }, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else res.redirect("back");
    });
});

module.exports = router;