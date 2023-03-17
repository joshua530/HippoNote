const express = require("express");
const router = express.Router();

/**
 * route: /account
 */
router.get("/", function (req, res) {});

router
    .route("/update")
    .get(function (req, res) {})
    .post(function (req, res) {});

router.post("/delete", function (req, res) {});

module.exports = router;
