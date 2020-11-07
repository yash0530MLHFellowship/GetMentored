const express = require("express");
const Community = require("../models/community");
const auth = require("../config/auth");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const fs = require("fs");

router.get("/", (req, res) => {
    res.render("community/home");
});

// pagination for community homes
router.get("/posts/:start/:end", (req, res) => {
    Community.find({ status: true }, null, {
        skip: Number(req.params.start), // Starting Row
        limit: Number(req.params.end), // Ending Row
        sort: {
            created: -1 // Sort by Date Added DESC
        }
    }, (err, posts) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            res.json({ posts, user: req.user });
        }
    });
})

router.get("/new", auth.isStudentLoggedIn, (req, res) => {
    res.render("community/new");
});

router.post("/", auth.isStudentLoggedIn, upload.single("file"), (req, res) => {
    const { title, text, city } = req.body;
    let errors = [];
    if (!title || !text || !city)
        errors.push('Please fill in all required fields');
    // if (req.file)
    //     if (req.file.size > 2000 * 1000)
    //         errors.push('Cannot upload files greater than 2 MB');
    if (errors.length > 0)
        res.render("community/new", { errors, title, text, city });
    else {
        // let image = '';
        // if (req.file)
        //     image = {
        //         data: req.file.buffer,
        //         contentType: req.file.mimetype
        //     };
        Community.create({
            text,
            title,
            // image,
            city,
            author: {
                id: req.user._id,
                name: req.user.name
            }
        }, (err, post) => {
            if (err) {
                console.log(err);
                res.redirect("/");
            }
            else res.redirect(`community/${post._id}`);
        });
    }
});

router.get("/:id", (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else res.render("community/show", { post });
    });
});

router.get("/:id/edit", auth.isStudentLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.user._id.equals(post.author.id)) {
                res.render("community/edit", post);
            } else {
                res.redirect("back");
            }
        }
    });
});

router.post("/:id", auth.isStudentLoggedIn, upload.single("file"), (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.user._id.equals(post.author.id)) {
                const { title, text, city } = req.body;
                let errors = [];
                if (!title || !text || !city)
                    errors.push('Please fill in all required fields');
                // if (req.file)
                //     if (req.file.size > 2000 * 1000)
                //         errors.push('Cannot upload files greater than 2 MB');
                if (errors.length > 0)
                    res.render("community/new", { errors, title, text, city });
                else {
                    // if (req.file) {
                    //     image = {
                    //         data: req.file.buffer,
                    //         contentType: req.file.mimetype
                    //     };
                        Community.findByIdAndUpdate(req.params.id, { text, title, city }, (err, post) => {
                            if (err) {
                                console.log(err);
                                res.redirect("/");
                            } else res.redirect('/community');
                        });
                    // } else {
                        // Community.findByIdAndUpdate(req.params.id, { text, title }, (err, post) => {
                        //     if (err) {
                        //         console.log(err);
                        //         res.redirect("/");
                        //     } else res.redirect('/community');
                        // });
                    // }
                }
            } else {
                res.redirect("back");
            }
        }
    });
});

router.get("/:id/delete", auth.isStudentLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (req.user._id.equals(post.author.id)) {
                Community.findByIdAndDelete(req.params.id, (err, post) => {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    }
                    else res.redirect("/community");
                })
            } else {
                res.redirect("back");
            }
        }
    });
});

router.get("/:id/admin/delete", auth.isAdminLoggedIn, (req, res) => {
    Community.findByIdAndDelete(req.params.id, (err, post) => {
        if (err) console.log(err);
        else {
            req.flash('success_msgs', 'Item Deleted');
            res.redirect("/admin/home");
        }
    });
});


router.get("/:id/comment/new", auth.isStudentLoggedIn, (req, res) => {
    res.render("community/comment_new", { id: req.params.id });
});

router.post("/:id/comment", auth.isStudentLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            post.comments.unshift({
                text: req.body.text,
                author: {
                    id: req.user._id,
                    name: req.user.name
                }
            });
            post.save((err, post) => {
                res.redirect(`/community/${post._id}`);
            })
        }
    });
});

router.get("/:id/comment/:comment_id/edit", auth.isStudentLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            let found = false;
            post.comments.forEach((comment) => {
                if (comment._id.equals(req.params.comment_id)) {
                    if (comment.author.id.equals(req.user._id)) {
                        found = true;
                        res.render("community/comment_edit", {
                            id: req.params.id,
                            comment_id: req.params.comment_id,
                            text: comment.text
                        });
                    }
                }
            });
            if (!found) res.redirect("back");
        }
    });
});

router.post("/:id/comment/:comment_id/", auth.isStudentLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            let found = false;
            post.comments.forEach((comment) => {
                if (comment._id.equals(req.params.comment_id)) {
                    if (comment.author.id.equals(req.user._id)) {
                        found = true;
                        comment.text = req.body.text;
                        post.save((err, post) => {
                            if (err) {
            console.log(err);
            res.redirect("/");
        }
                            else res.redirect(`/community/${post._id}`);
                        });
                    }
                }
            });
            if (!found) res.redirect("back");
        }
    });
});

router.get("/:id/comment/:comment_id/delete", auth.isUserLoggedIn, (req, res) => {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            let found = false;
            post.comments.forEach((comment, index, obj) => {
                if (comment._id.equals(req.params.comment_id)) {
                    if (comment.author.id.equals(req.user._id) || req.user.userType == "ADMIN") {
                        found = true;
                        obj.splice(index, 1);
                        post.save((err, post) => {
                            if (err) {
            console.log(err);
            res.redirect("/");
        }
                            else res.redirect(`/community/${post._id}`);
                        });
                    }
                }
            });
            if (!found) res.redirect("back");
        }
    });
});

// get image of post
router.get('/get_image/:id', function (req, res) {
    Community.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.send("error");
        }
        else if (post.image) {
            if (post.image.contentType && post.image.data) {
                res.contentType(post.image.contentType);
                res.send(post.image.data);
            } else {
                res.contentType("image/jpg");
                res.send(fs.readFileSync("public/assets/post.jpg"));
            }
        }
    });
});

// for development
router.get("/show/all", (req, res) => Community.find({}, (err, posts) => res.json(posts)));

module.exports = router;