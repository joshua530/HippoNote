const express = require("express");
const router = express.Router();

/**
 * route: /
 */
router.get("/", function (req, res) {});

router
    .route("/login")
    .get(function (req, res) {})
    .post(function (req, res) {});

router
    .route("/sign-up")
    .get(function (req, res) {})
    .post(function (req, res) {});

router.get("/dashboard", function (req, res) {});

module.exports = router;
