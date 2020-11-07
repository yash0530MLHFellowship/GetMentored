// importing modules
const express = require("express");
const mongoose = require("mongoose");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const constants = require('./config/constants');

// passport setup
require('./config/passport')(passport);

// setting up mongoose
mongoose.connect("-----", { useNewUrlParser: true });

// setting up the app
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

// passport setup
app.use(cookieParser('secretString'));
app.use(
    session({
        secret: process.env.SECRET || constants.secret,
        resave: true,
        saveUninitialized: true
    })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// global variables
app.use((req, res, next) => {
    res.locals.industries = constants.industries;
    res.locals.mentorship_status = constants.mentorship_status;
    res.locals.internship_status = constants.internship_status;
    res.locals.volunteership_status = constants.volunteership_status;
    res.locals.cv_builder_status = constants.cv_builder_status;
    res.locals.user = req.user;
    res.locals.success_msgs = req.flash('success_msgs');
    res.locals.error_msgs = req.flash('error_msgs');
    next();
})

// routes
app.use("/", require("./routes/index"));
app.use("/student", require("./routes/student"));
app.use("/admin", require("./routes/admin"));
app.use("/mentor", require("./routes/mentor"));
app.use("/community", require("./routes/community"));
app.use("/internship_opportunities", require("./routes/internship"));
app.use("/volunteership_opportunities", require("./routes/volunteership"));
app.get("*", (req, res) => res.send("PAGE NOT FOUND"));

// starting server
app.listen(process.env.PORT || 3000, process.env.IP);