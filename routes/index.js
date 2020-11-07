const express = require("express");

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => res.render("student/home"));

router.get("/about_us", (req, res) => res.render("about_us"));

router.get("/privacy_policy", (req, res) => res.render("privacy_policy"));

router.get("/terms_of_use", (req, res) => res.render("terms_of_use"));

// router.get("/reach_us", (req, res) => res.render("reach_us"));

module.exports = router;