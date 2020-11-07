const express = require("express");
const auth = require('../config/auth');
const multer = require('multer');
const fs = require('fs');

const VolunteershipOpportunity = require("../models/volunteership_opportunity");
const Student = require("../models/student");

const router = express.Router({ mergeParams: true });
const upload = multer();

// display volunteership_opportunities
router.get("/show", (req, res) => {
    VolunteershipOpportunity.find({}, (err, volunteership_opportunities) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            res.render("volunteership/opportunities", { volunteership_opportunities });
        }
    });
});

// display volunteership_opportunities by id
router.get("/show/:id", (req, res) => {
    VolunteershipOpportunity.findById(req.params.id, (err, volunteership_opportunity) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.isAuthenticated() && req.user.userType == "STUDENT") {
                Student.findById(req.user._id).populate("volunteerships").exec((err, user) => {
                    res.render("volunteership/opportunity", { opportunity: volunteership_opportunity, user });
                });
            } else
                res.render("volunteership/opportunity", { opportunity: volunteership_opportunity });
        }
    });
});

// register route
router.get("/register", auth.isAdminLoggedIn, (req, res) => {
    res.render("volunteership/register");
});

router.post("/register", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    console.log("in");
    const { org_name, profile, cities, description1, description, duration, openings } = req.body;
    let errors = [];
    if (!org_name || !profile || !cities || !description1 || !description1 || !duration || !openings)
        errors.push('Please fill in all required fields');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("volunteership/register", { errors, org_name, profile, cities, description1, description: description.trim(), duration, openings });
    else {
        let org_logo = '';
        if (req.file)
            org_logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        // update = { $set: { org_name, org_logo, profile, cities, short_description:description1, description: description.trim(), duration, openings_left:openings } };
        VolunteershipOpportunity.create({
            org_name, 
            org_logo, 
            profile, 
            cities, 
            short_description:description1, 
            description: description.trim(), 
            duration, 
            openings_left:openings
        }, (err, opportunity) => {
            if (err) {
            console.log(err);
            res.redirect("/");
        }
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Volunteership details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

router.get("/edit/:id", auth.isAdminLoggedIn, (req, res) => {
    VolunteershipOpportunity.findById(req.params.id, (err, opportunity) => {
        if (err || !opportunity) {
            console.log(err);
            req.flash('error_msgs', 'No such volunteership opportunity exists. Do you want to register a new one?');
            res.redirect("/volunteership/register");
        }
        else {
            const { org_name, profile, cities, description, duration, _id } = opportunity;
            const description1 = opportunity.short_description;
            const openings = opportunity.openings_left;
            res.render("volunteership/edit", { org_name, profile, cities, description1, description, duration, openings, _id });
        }
    });
});

router.post("/edit/:id", auth.isAdminLoggedIn, upload.single("file"), (req, res) => {
    const { org_name, profile, cities, description1, description, duration, openings } = req.body;
    let errors = [];
    console.log(req.file);
    if (!org_name || !profile || !cities || !description1 || !description1 || !duration || !openings)
        errors.push('Please fill in all required fields');
    if (req.file)
        if (req.file.size > 2000 * 1000)
            errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("volunteership/register", { errors, org_name, profile, cities, description1, description: description.trim(), duration, openings });
    else {
        let update = '';
        if (req.file) {
            let org_logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            update = { $set: { org_name, org_logo, profile, cities, short_description:description1, description: description.trim(), duration, openings_left:openings } };
        } else {
            update = { $set: { org_name, profile, cities, short_description:description1, description: description.trim(), duration, openings_left:openings } };
        }
        VolunteershipOpportunity.findOneAndUpdate({_id:req.params.id}, update, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log(doc);
                req.flash('success_msgs', 'Mentor details saved.');
                res.redirect('/admin/home');
            }
        });
    }
});

router.get('/delete/:id', auth.isAdminLoggedIn, (req, res) => {
    VolunteershipOpportunity.findByIdAndDelete(req.params.id, (err, post) => {
        if (err) console.log(err);
        else {
            req.flash('success_msgs', 'Item Deleted');
            res.redirect("/admin/home");
        }
    });
});

// get image of company
router.get('/get_image/:id', function (req, res) {
    VolunteershipOpportunity.findById(req.params.id, (err, opportunity) => {
        if (err) {
            console.log(err);
            res.contentType("image/png");
            res.send(fs.readFileSync("public/assets/volunteership.png"));
        }
        else if (opportunity.org_logo) {
            if (opportunity.org_logo.contentType && opportunity.org_logo.data) {
                res.contentType(opportunity.org_logo.contentType);
                res.send(opportunity.org_logo.data);
            } else {
                res.contentType("image/png");
                res.send(fs.readFileSync("public/assets/volunteership.png"));
            }
        }
    });
});

// // for development purposes
// router.get("/all", (req, res) => VolunteershipOpportunity.find({}, (err, volunteerships) => res.json(volunteerships)));

module.exports = router;