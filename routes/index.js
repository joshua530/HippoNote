const express = require("express");
const User = require("../models/user-model");
const router = express.Router();
const { verifyPassword } = require("../utils");

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
        console.log(user);
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
    .post(function (req, res) {});

router.get("/dashboard", function (req, res) {
    res.render("dashboard.html", { title: "dashboard" });
});

module.exports = router;
