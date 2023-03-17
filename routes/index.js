const express = require("express");
const router = express.Router();

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
    .post(function (req, res) {});

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
