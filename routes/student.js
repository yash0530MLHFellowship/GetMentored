const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require('passport');
const auth = require('../config/auth');
const { secretNumber, vaildateEmail } = require('../config/constants');
const multer = require('multer');
const fs = require('fs');

// importing models
const Student = require("../models/student");
const CV_Builder = require("../models/cv_builder");
const InternshipOpportunity = require("../models/internship_opportunity");
const Internship = require("../models/internship");
const Mentor = require('../models/mentor');
const Mentorship = require("../models/mentorship");
const VolunteershipOpportunity = require("../models/volunteership_opportunity");
const Volunteership = require("../models/volunteership");

const router = express.Router();
const upload = multer();

// student home
router.get("/home", (req, res) => {
    res.render("student/home");
});

// student profile
router.get("/profile/:id", (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (student && req.user && req.isAuthenticated() && ((req.user.userType === "STUDENT" && student._id.equals(req.user._id)) || req.user.userType == "ADMIN")) {
                Student.findById(req.params.id).populate("mentorships").populate("volunteerships").
                populate("internships").populate("cv_builder").exec((err, student) => {
                    if (err) console.log(err);
                    else {
                        console.log(student);
                        res.render("student/profile", { student });
                    }
                });
            }
            else {
                // res.render("student/profile", { student });
                req.flash('error_msgs', "You cannot view some other user's profile");
                res.redirect("/");
            }
        }
    });
});

// login routes
router.get("/login", (req, res) => {
    if (req.isAuthenticated() && req.user.userType === "STUDENT") {
        res.redirect("/student/home");
    } else {
        res.render("student/login");
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('student-local', {
        successRedirect: '/student/home',
        failureRedirect: '/student/login',
        failureFlash: true
    })(req, res, next);
});

// register routes
router.get("/register", (req, res) => {
    res.render("student/register");
});

router.post("/register", upload.single("file"), (req, res) => {
    const { name, email, dob, contactNum, password1, password2, highestEdQual, city, awardsNRecog, workExp, volunteerExp } = req.body;
    let errors = [];
    if (!name || !email || !dob || !contactNum || !password1 || !password2 || !highestEdQual || !city) {
        errors.push('Please fill in all required fields');
    }
    if (password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if (password1.length < 8) {
        errors.push('Password should be at least 8 characters long');
    }
    if (contactNum.length != 10) {
        errors.push('Contact Number should be excatly 10 digits');
    }
    if (!vaildateEmail(email)) {
        errors.push('Please enter a valid email');
    }
    let d = new Date();
    if (d != "Invalid Date") {
        d.setFullYear(d.getFullYear() - 18);
        let DoB = new Date(dob)
        if (DoB > d) {
            errors.push('To register, you must be at least 18 years old');
        }
    } else
        errors.push('To register, you must enter valid date');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0) {
        res.render("student/register", { errors, name, email, dob, contactNum, password1, password2, highestEdQual, city, awardsNRecog, workExp, volunteerExp });
    } else {
        Student.findOne({ email })
            .then(student => {
                if (student) {
                    errors.push('This email has already been registered');
                    res.render("student/register", { errors, name, email, dob, contactNum, password1, password2, highestEdQual, city });
                } else {
                    let image = '';
                    if (req.file) {
                        image = {
                            data: req.file.buffer,
                            contentType: req.file.mimetype
                        };
                    }
                    const newStudent = new Student({
                        name,
                        dob: new Date(dob),
                        image,
                        email,
                        contactNum,
                        city,
                        highestEdQual,
                        workExp: workExp.trim(),
                        volunteerExp: volunteerExp.trim(),
                        awardsNRecog: awardsNRecog.trim(),
                        password: password1
                    });
                    bcrypt.genSalt(secretNumber, (err, salt) => {
                        bcrypt.hash(newStudent.password, salt, (err, hash) => {
                            if (err) { throw err; }
                            newStudent.password = hash;
                            newStudent.save()
                                .then(student => {
                                    req.flash('success_msgs', 'Successfully registered!');
                                    res.redirect('/student/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            })
    }
});

// edit routes
router.get("/edit", auth.isStudentLoggedIn, (req, res) => {
    let user = req.user;
    console.log(user);
    res.render("student/edit", { name: user.name, email: user.email, dob: user.dob, contactNum: user.contactNum, highestEdQual: user.highestEdQual, city: user.city, awardsNRecog: user.awardsNRecog, workExp: user.workExp, volunteerExp: user.volunteerExp, _id: user._id });
});

router.post("/edit", auth.isStudentLoggedIn, upload.single("file"), (req, res) => {
    const { name, dob, contactNum, password1, password2, highestEdQual, city, awardsNRecog, workExp, volunteerExp } = req.body;
    let errors = [];
    if (!name || !dob || !highestEdQual || !city || !contactNum) {
        errors.push('Please fill in all required fields');
    }
    if ((password1 || password2) && password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if ((password1 && password1.length < 8) || (password2 && password2.length < 8)) {
        errors.push('Password should be at least 8 characters long');
    }
    if (contactNum.length != 10) {
        errors.push('Contact Number should be excatly 10 digits');
    }
    if (!vaildateEmail(email)) {
        errors.push('Please enter a valid email');
    }
    let d = new Date();
    if (d != "Invalid Date") {
        d.setFullYear(d.getFullYear() - 18);
        let DoB = new Date(dob);
        if (DoB > d) {
            errors.push('You must be at least 18 years old');
        }
    } else
        errors.push('You must enter valid date');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0) {
        res.render("student/edit", { errors, name, dob, password1, password2, highestEdQual, city, awardsNRecog, workExp, volunteerExp, contactNum, _id: req.user._id });
    } else {
        let update;
        if (req.file) {
            let image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            if (password1) {
                let password = password1;
                bcrypt.genSalt(secretNumber, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) { throw err; }
                        password = hash;
                    })
                });
                update = { $set: { name, dob, image, highestEdQual, city, contactNum, awardsNRecog: awardsNRecog.trim(), workExp: workExp.trim(), volunteerExp: volunteerExp.trim(), password } };
            } else {
                update = { $set: { name, dob, image, highestEdQual, city, contactNum, awardsNRecog: awardsNRecog.trim(), workExp: workExp.trim(), volunteerExp: volunteerExp.trim() } };
            }
        } else {
            if (password1) {
                let password = password1;
                bcrypt.genSalt(secretNumber, (err, salt) => {
                    bcrypt.hash(newStudent.password, salt, (err, hash) => {
                        if (err) { throw err; }
                        password = hash;
                    })
                });
                update = { $set: { name, dob, highestEdQual, city, contactNum, awardsNRecog: awardsNRecog.trim(), workExp: workExp.trim(), volunteerExp: volunteerExp.trim(), password } };
            } else {
                update = { $set: { name, dob, highestEdQual, city, contactNum, awardsNRecog: awardsNRecog.trim(), workExp: workExp.trim(), volunteerExp: volunteerExp.trim() } };
            }
        }
        
        Student.findOneAndUpdate({ email: req.user.email }, update, { new: false, upsert: false }, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Profile updated.');
                res.redirect(`/student/profile/${req.user._id}`);
            }
        });
    }
});

// logout routes
router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success_msgs', 'Successfully logged out');
    res.redirect('/student/login')
});

// create a mentorship request
router.get("/recieve/mentorship/:mentor", auth.isStudentLoggedIn, (req, res) => {
    Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
        if (err) console.log(err);
        else {
            Mentor.findById(req.params.mentor, (err, mentor) => {
                if (err) console.log(err);
                else {
                    let found = false;
                    student.mentorships.forEach(mentorship => {
                        if (mentorship.mentor.id.equals(mentor._id)) found = true;
                    });
                    if (!found) {
                        Mentorship.create({
                            mentor: { id: mentor._id, name: mentor.name },
                            student: { id: student._id, name: student.name }
                        }, (err, mentorship) => {
                            if (err) console.log(err);
                            else {
                                student.mentorships.push(mentorship);
                                student.save((err, data) => {
                                    if (err) console.log(err);
                                    else res.redirect("back");
                                });
                            }
                        });
                    } else
                        res.redirect("back");
                }
            });
        }
    });
});

// create an internship request
router.get("/recieve/internship/:internship_opportunity", auth.isStudentLoggedIn, (req, res) => {
    Student.findById(req.user._id).populate("internships").exec((err, student) => {
        if (err) console.log(err);
        else {
            InternshipOpportunity.findById(req.params.internship_opportunity, (err, internship_opportunity) => {
                if (err) console.log(err);
                else {
                    let found = false;
                    student.internships.forEach(internship => {
                        if (internship.internship_opportunity.id.equals(internship_opportunity._id)) found = true;
                    });
                    if (!found) {
                        Internship.create({
                            internship_opportunity:
                            {
                                id: internship_opportunity._id,
                                short_description: internship_opportunity.short_description
                            },
                            student: { id: student._id, name: student.name }
                        }, (err, internship) => {
                            if (err) console.log(err);
                            else {
                                student.internships.push(internship);
                                student.save((err, data) => {
                                    if (err) console.log(err);
                                    else res.redirect("back");
                                });
                            }
                        });
                    } else
                        res.redirect("back");
                }
            });
        }
    });
});

// create an volunteership request
router.get("/recieve/volunteership/:volunteership_opportunity", auth.isStudentLoggedIn, (req, res) => {
    Student.findById(req.user._id).populate("volunteerships").exec((err, student) => {
        if (err) console.log(err);
        else {
            VolunteershipOpportunity.findById(req.params.volunteership_opportunity, (err, volunteership_opportunity) => {
                if (err) console.log(err);
                else {
                    let found = false;
                    student.volunteerships.forEach(volunteership => {
                        if (volunteership.volunteership_opportunity.id.equals(volunteership_opportunity._id)) found = true;
                    });
                    if (!found) {
                        Volunteership.create({
                            volunteership_opportunity:
                            {
                                id: volunteership_opportunity._id,
                                short_description: volunteership_opportunity.short_description
                            },
                            student: { id: student._id, name: student.name }
                        }, (err, volunteership) => {
                            if (err) console.log(err);
                            else {
                                student.volunteerships.push(volunteership);
                                student.save((err, data) => {
                                    if (err) console.log(err);
                                    else res.redirect("back");
                                });
                            }
                        });
                    } else
                        res.redirect("back");
                }
            });
        }
    });
});

// create a cv builder request
router.get("/recieve/cv_builder", auth.isStudentLoggedIn, (req, res) => {
    Student.findById(req.user._id).populate("cv_builder").exec((err, student) => {
        if (err) console.log(err);
        else {
            CV_Builder.create({
                student: { id: student._id, name: student.name }
            }, (err, cv) => {
                if (err) console.log(err);
                else {
                    student.cv_builder.push(cv);
                    student.save((err, student) => {
                        console.log(student);
                        if (err) console.log(err);
                        else res.redirect("back");
                    });
                }
            });
        }
    });
});

// cv builder
router.get("/cv_builder", (req, res) => {
    if (req.isAuthenticated() && req.user.userType == "STUDENT") {
        Student.findById(req.user._id).populate("cv_builder").exec((err, user) => {
            res.render("student/cv_builder", { user });
        });
    } else
        res.render("student/cv_builder");
});

// get image of student
router.get('/get_image/:id', function (req, res) {
    Student.findById(req.params.id, (err, student) => {
        if (err) {
            console.log(err);
            res.contentType("image/png");
            res.send(fs.readFileSync("public/assets/student/student_profile.png"));
        }
        else if (student.image) {
            if (student.image.contentType && student.image.data) {
                res.contentType(student.image.contentType);
                res.send(student.image.data);
            } else {
                res.contentType("image/png");
                res.send(fs.readFileSync("public/assets/student/student_profile.png"));
            }
        }
    });
});

// router.get("/dev/all", auth.isAdminLoggedIn, (req, res) => {
//     Student.find({}, (err, students) => {
//         res.json(students);
//     })
// });

module.exports = router;