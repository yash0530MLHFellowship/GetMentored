const express = require("express");
const auth = require('../config/auth');
const { industries } = require('../config/constants');
const multer = require('multer');
const fs = require('fs');

const Mentor = require("../models/mentor");
const Student = require("../models/student");

const router = express.Router({ mergeParams: true });
const upload = multer();

// display industries
router.get("/show", (req, res) => {
    Mentor.find({}, (err, mentors) => {
        let industries = new Set([]);
        if (err) {
            console.log(err);
        } else {
            mentors.forEach(mentor => {
                industries.add(mentor.industry);
            });
        }
        industries = Array.from(industries).map(industry => { return { name: industry } });
        res.render("mentor/industries", { industries });
    });
});

// display mentors by industry
router.get("/show/:industry", (req, res) => {
    Mentor.find({ industry: req.params.industry }, (err, mentors) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            let index = -1;
            industries.forEach((ind, i) => index = (ind.name == req.params.industry) ? i : index);
            res.render("mentor/mentors", { mentors, index });
        }
    });
});

// display mentor by id
router.get("/show/:industry/:id", (req, res) => {
    Mentor.findById(req.params.id, (err, mentor) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.isAuthenticated() && req.user.userType == "STUDENT") {
                Student.findById(req.user._id).populate("mentorships").exec((err, user) => {
                    res.render("mentor/mentor", { mentor, user });
                });
            } else
                res.render("mentor/mentor", { mentor });
        }
    });
});

// register route
router.get("/register", auth.isAdminLoggedIn, (req, res) => {
    res.render("mentor/register");
});

router.get("/edit/:id", auth.isAdminLoggedIn, (req, res) => {
    Mentor.findById(req.params.id, (err, mentor) => {
        if (err || !mentor) {
            console.log(err);
            req.flash('error_msgs', 'No such mentor exists. Do you want to register a new one?');
            res.redirect("/mentor/register");
        }
        else {
            const { name, email, contactNum, city, quote, workExp, industry, _id } = mentor;
            res.render("mentor/edit", { name, email, contactNum, city, quote, workExp, industry, _id, mentor });
        }
    });
});

router.post("/register", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    const { name, email, contactNum, city, quote, workExp, industry } = req.body;
    let errors = [];
    if (!name || !email || !contactNum || !city || !quote || !workExp || !industry)
        errors.push('Please fill in all required fields');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("mentor/register", { errors, name, email, contactNum, city, quote, workExp: workExp.trim(), industry });
    else {
        let image = '';
        if (req.file)
            image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        let update = { $set: { name, email, contactNum, image, quote, workExp: workExp.trim(), city, industry } };
        Mentor.findOneAndUpdate({ email }, update, { new: true, upsert: true }, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Mentor details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

router.post("/edit", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    const { name, email, contactNum, city, quote, workExp, industry } = req.body;
    let errors = [];
    if (!name || !email || !contactNum || !city || !quote || !workExp || !industry)
        errors.push('Please fill in all required fields');
    if (req.file) {
        console.log("Req.file exists")
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    }
    if (errors.length > 0)
        res.render("mentor/edit", { errors, name, email, contactNum, city, quote, workExp: workExp.trim(), industry, _id: mentor._id });
    else {
        let update = '';
        if (req.file) {
            let image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            update = { $set: { name, email, contactNum, image, quote, workExp: workExp.trim(), city, industry } }
        } else {
            update = { $set: { name, email, contactNum, quote, workExp: workExp.trim(), city, industry } }
        }
        Mentor.findOneAndUpdate({ email }, update, { new: true, upsert: true }, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Mentor details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

router.get("/delete/:id", auth.isAdminLoggedIn, (req, res) => {
    Mentor.findByIdAndDelete(req.params.id, (err, post) => {
        if (err) console.log(err);
        else {
            req.flash('success_msgs', 'Item Deleted');
            res.redirect("/admin/home");
        }
    })
});

// get image of mentor
router.get('/get_image/:id', function (req, res) {
    Mentor.findById(req.params.id, (err, mentor) => {
        if (err) {
            console.log(err);
            res.contentType("image/png");
            res.send(fs.readFileSync("public/assets/mentor/mentor_profile.png"));
        }
        else if (mentor.image) {
            if (mentor.image.contentType && mentor.image.data) {
                res.contentType(mentor.image.contentType);
                res.send(mentor.image.data);
            } else {
                res.contentType("image/png");
                res.send(fs.readFileSync("public/assets/mentor/mentor_profile.png"));
            }
        }
    });
});

// reviews
router.get("/review/:id", auth.isStudentLoggedIn, (req, res) => {
    let found = false;
    Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
        student.mentorships.forEach(mentorship => {
            if (mentorship.mentor.id.equals(req.params.id)) {
                found = true;
                res.render("mentor/review_form", { mentor_id: req.params.id });
            }
        });
        if (!found) {
            req.flash('error_msgs', 'You can only review your own mentors');
            res.redirect("back");
        }
    });
});

router.post("/review/:id", auth.isStudentLoggedIn, (req, res) => {
    let text = req.body.text.trim();
    if (text) {
        let found = false;
        Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
            student.mentorships.forEach(mentorship => {
                if (mentorship.mentor.id.equals(req.params.id)) {
                    found = true;
                    Mentor.findById(req.params.id, (err, mentor) => {
                        mentor.reviews.unshift({
                            text: text,
                            author: {
                                id: req.user._id,
                                name: req.user.name
                            }
                        });
                        mentor.save((err, mentor) => {
                            res.redirect(`/mentor/show/${mentor.industry}/${mentor._id}`);
                        });
                    });
                }
            });
            if (!found) res.redirect("back");
        });
    } else {
        req.flash('error_msgs', 'Review cannot be empty');
        res.redirect(`/mentor/review/${req.params.id}`);
    }
});

router.get("/review/edit/:mentor/:review", auth.isStudentLoggedIn, (req, res) => {
    let found = false;
    Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
        student.mentorships.forEach(mentorship => {
            if (mentorship.mentor.id.equals(req.params.mentor)) {
                found = true;
                Mentor.findById(req.params.mentor, (err, mentor) => {
                    let match = false;
                    mentor.reviews.forEach((review) => {
                        if (review._id.equals(req.params.review)) {
                            match = true;
                            res.render("mentor/edit_review_form", {
                                mentor_id: req.params.mentor,
                                review_id: req.params.review,
                                text: review.text
                            });
                        }
                    });
                    if (!match) res.redirect("back");
                });
            }
        });
        if (!found) res.redirect("back");
    })
});

router.post("/review/edit/:mentor/:review", auth.isStudentLoggedIn, (req, res) => {
    let text = req.body.text.trim();
    if (text) {
        let found = false;
        Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
            student.mentorships.forEach(mentorship => {
                if (mentorship.mentor.id.equals(req.params.mentor)) {
                    found = true;
                    Mentor.findById(req.params.mentor, (err, mentor) => {
                        let match = false;
                        mentor.reviews.forEach((review) => {
                            if (review._id.equals(req.params.review)) {
                                match = true;
                                review.text = text;
                            }
                        });
                        if (!match) {
                            res.redirect("back");
                        } else {
                            mentor.save((err, mentor) => {
                                res.redirect(`/mentor/show/${mentor.industry}/${mentor._id}`);
                            });
                        }
                    });
                }
            });
            if (!found) res.redirect("back");
        })
    } else {
        req.flash('error_msgs', 'Review cannot be empty');
        res.redirect(`/mentor/review/${req.params.id}`);
    }
});

router.get("/review/delete/:mentor/:review", auth.isUserLoggedIn, (req, res) => {
    if (req.user.userType == "ADMIN") {
        Mentor.findById(req.params.mentor, (err, mentor) => {
            mentor.reviews.pull({ _id: req.params.review });
            mentor.save((err, mentor) => {
                res.redirect("back");
            });
        });
    } else {
        let found = false;
        Student.findById(req.user._id).populate("mentorships").exec((err, student) => {
            student.mentorships.forEach(mentorship => {
                if (mentorship.mentor.id.equals(req.params.mentor)) {
                    found = true;
                    Mentor.findById(req.params.mentor, (err, mentor) => {
                        mentor.reviews.pull({ _id: req.params.review });
                        mentor.save((err, mentor) => { });
                    });
                }
            });
            res.redirect("back");
        });
    }
});

// // for development purposes
// router.get("/all", (req, res) => Mentor.find({}, (err, mentors) => res.json(mentors)));

module.exports = router;