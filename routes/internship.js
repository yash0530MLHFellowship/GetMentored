const express = require("express");
const auth = require('../config/auth');
const { industries } = require('../config/constants');
const multer = require('multer');
const fs = require('fs');

const InternshipOpportunity = require("../models/internship_opportunity");
const Student = require("../models/student");

const router = express.Router({ mergeParams: true });
const upload = multer();

// display internship_opportunities
router.get("/show", (req, res) => {
    InternshipOpportunity.find({}, (err, internship_opportunities) => {
        let industries = new Set([]);
        if (err) {
            console.log(err);
        } else {
            internship_opportunities.forEach(internship_opportunity => {
                industries.add(internship_opportunity.industry);
            });
        }
        industries = Array.from(industries).map(industry => { return { name: industry } });
        res.render("internship/industries", { industries });
    });
});

// display internship_opportunities by industry
router.get("/show/:industry", (req, res) => {
    InternshipOpportunity.find({ industry: req.params.industry }, (err, internship_opportunities) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            let index = -1;
            industries.forEach((ind, i) => index = (ind.name == req.params.industry) ? i : index);
            res.render("internship/opportunities", { internship_opportunities, index });
        }
    });
});

// display internship_opportunities by id
router.get("/show/:industry/:id", (req, res) => {
    InternshipOpportunity.findById(req.params.id, (err, internship_opportunity) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.isAuthenticated() && req.user.userType == "STUDENT") {
                Student.findById(req.user._id).populate("internships").exec((err, user) => {
                    res.render("internship/opportunity", { opportunity: internship_opportunity, user });
                });
            } else
                res.render("internship/opportunity", { opportunity: internship_opportunity });
        }
    });
});

// register route
router.get("/register", auth.isAdminLoggedIn, (req, res) => {
    res.render("internship/register");
});

router.post("/register", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    const { org_name, profile, stipend, city, description1, description, duration, openings, industry } = req.body;
    let errors = [];
    if (!org_name || !profile || !city || !description1 || !description || !duration || !openings || !industry)
        errors.push('Please fill in all required fields');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("internship/register", { errors, org_name, profile, stipend, city, description1, description: description.trim(), duration, openings, industry });
    else {
        let org_logo = '';
        if (req.file)
            org_logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        // update = { $set: { org_name, org_logo, profile, stipend, city, short_description:description1, description: description.trim(), duration, openings_left:openings, industry } };
        InternshipOpportunity.create({
            org_name,
            org_logo,
            profile,
            stipend,
            city,
            short_description: description1,
            description: description.trim(),
            duration,
            openings_left: openings,
            industry
        }, (err, opportunity) => {
            if (err) {
                console.log(err);
                res.redirect("/");
            }
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Internship details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

router.get("/edit/:id", auth.isAdminLoggedIn, (req, res) => {
    InternshipOpportunity.findById(req.params.id, (err, opportunity) => {
        if (err || !opportunity) {
            console.log(err);
            req.flash('error_msgs', 'No such internship opportunity exists. Do you want to register a new one?');
            res.redirect("/internship/register");
        }
        else {
            const { org_name, profile, stipend, city, description, duration, industry, _id } = opportunity;
            const openings = opportunity.openings_left;
            const description1 = opportunity.short_description;
            res.render("internship/edit", { org_name, profile, stipend, city, description1, description, duration, openings, industry, _id });
        }
    });
});

router.post("/edit/:id", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    const { org_name, profile, stipend, city, description1, description, duration, openings, industry } = req.body;
    let errors = [];
    console.log(req.file);
    if (!org_name || !profile || !city || !description1 || !description || !duration || !openings || !industry)
        errors.push('Please fill in all required fields');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("internship/register", { errors, org_name, profile, stipend, city, description1, description: description.trim(), duration, openings, industry });
    else {
        let update = '';
        if (req.file) {
            let org_logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            update = { $set: { org_name, org_logo, profile, stipend, city, short_description: description1, description: description.trim(), duration, openings_left: openings, industry } };
        } else {
            update = { $set: { org_name, profile, stipend, city, short_description: description1, description: description.trim(), duration, openings_left: openings, industry } };
        }
        InternshipOpportunity.findOneAndUpdate({ _id: req.params.id }, update, { new: true, upsert: true }, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Mentor details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

// get image of company
router.get('/get_image/:id', function (req, res) {
    InternshipOpportunity.findById(req.params.id, (err, opportunity) => {
        if (err) {
            console.log(err);
            res.contentType("image/jpeg");
            res.send(fs.readFileSync("public/assets/internship.jpeg"));
        }
        else if (opportunity.org_logo) {
            if (opportunity.org_logo.contentType && opportunity.org_logo.data) {
                res.contentType(opportunity.org_logo.contentType);
                res.send(opportunity.org_logo.data);
            } else {
                res.contentType("image/jpeg");
                res.send(fs.readFileSync("public/assets/internship.jpeg"));
            }
        }
    });
});

router.get('/delete/:id', auth.isAdminLoggedIn, (req, res) => {
    InternshipOpportunity.findByIdAndDelete(req.params.id, (err, post) => {
        if (err) console.log(err);
        else {
            req.flash('success_msgs', 'Item Deleted');
            res.redirect("/admin/home");
        }
    });
});

// // for development purposes
// router.get("/all", (req, res) => Internship.find({}, (err, internships) => res.json(internships)));

module.exports = router;