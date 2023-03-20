const express = require("express");
const User = require("../../models/user-model");
const UserNote = require("../../models/usernote-model");
const { getUserIdFromCookie } = require("../../utils");
const router = express.Router();

/**
 * route: /account
 */
router.get("/", async function (req, res) {
    const userId = getUserIdFromCookie(req);
    let user;
    try {
        user = await User.findOne({ _id: userId });
    } catch (e) {
        res.redirect("/500");
        return;
    }
    if (!user) {
        res.redirect("/404");
        return;
    }
    let numNotes = await UserNote.count({ userId });
    res.render("profile.html", { title: "profile", user, numNotes });
});

router
    .route("/update")
    .get(function (req, res) {})
    .post(function (req, res) {});

router.post("/delete", function (req, res) {});

module.exports = router;
