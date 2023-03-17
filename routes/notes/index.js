const express = require("express");
const router = express.Router();

/**
 * route: /notes
 */
router.get("/", function (req, res) {});

router.get("/search", function (req, res) {});

router
    .route("/:id")
    .get(function (req, res) {})
    .post(function (req, res) {});

router
    .route("/new")
    .get(function (req, res) {})
    .post(function (req, res) {});

module.exports = router;
