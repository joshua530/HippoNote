const express = require("express");
const User = require("../models/user-model");
const router = express.Router();
const { verifyPassword, generateImageUri } = require("../utils");

/**
 * route: /
 */
router.get("/", function (req, res) {
    res.render("index.html", { title: "home page" });
});

router
    .route("/login")
    .get(function (req, res) {
        res.render("login.html", { title: "login page" });
    })
    .post(async function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(400);
            res.render("login.html", {
                title: "login page",
                message: "username and password cannot be empty",
            });
            return;
        }
        const user = await User.findOne({ username: username }).exec();

        if (!user || !verifyPassword(password, user.password)) {
            res.status(400);
            res.render("login.html", {
                title: "login page",
                message: "invalid username or password",
            });
            return;
        }
        res.redirect("/login");
    });

router
    .route("/sign-up")
    .get(function (req, res) {
        res.render("sign-up.html", { title: "sign up" });
    })
    .post(async function (req, res) {
        let { username, password, email, password2 } = req.body;
        username = username.trim();
        password = password.trim();
        email = email.trim();
        password2 = password2.trim();
        if (!username || !email || !password || !password2) {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "fill in all details",
                    type: "danger",
                },
                username,
                email,
            });
            return;
        }
        if (password.length < 8) {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "password should be at least 8 characters in length",
                    type: "danger",
                },
                username,
                email,
            });
            return;
        }
        if (password !== password2) {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "the two passwords must match",
                    type: "danger",
                },
                username,
                email,
            });
            return;
        }
        let existing = await User.findOne({ username });
        if (existing) {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "that username is already taken",
                    type: "danger",
                },
                username,
                email,
            });
            return;
        }
        existing = await User.findOne({ email });
        if (existing) {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "that email is already taken",
                    type: "danger",
                },
                username,
                email,
            });
            return;
        }
        let user = await User.create({
            username,
            password,
            email,
            profilePicture: generateImageUri(),
        });
        if (user) {
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "account created successfully, you can now log in with your credentials",
                    type: "success",
                },
            });
        } else {
            res.status(400);
            res.render("sign-up.html", {
                title: "sign up",
                message: {
                    text: "error occured while creating user, please try again",
                    type: "danger",
                },
                username,
                email,
            });
        }
    });

router.get("/dashboard", function (req, res) {
    res.render("dashboard.html", { title: "dashboard" });
});

module.exports = router;
