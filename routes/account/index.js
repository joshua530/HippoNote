const express = require("express");
const User = require("../../models/user-model");
const UserNote = require("../../models/usernote-model");
const { getUserIdFromCookie } = require("../../utils");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Jwt = require("../../models/jwt-model");

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
    res.render("profile.html", {
        title: "profile",
        user,
        numNotes,
        authenticated: req.authenticated,
    });
});

router
    .route("/update")
    .get(async function (req, res) {
        const id = getUserIdFromCookie(req);
        const user = await User.findOne({ _id: id });
        res.render("update-profile.html", {
            title: "update profile",
            user,
            authenticated: req.authenticated,
        });
    })
    .post(
        body("username", "invalid username").not().isEmpty().trim().escape(),
        body("about", "about cannot be empty").not().isEmpty().trim().escape(),
        body("email", "invalid email").isEmail(),
        async function (req, res) {
            const errors = validationResult(req).array();
            const id = getUserIdFromCookie(req);
            const user = await User.findOne({ _id: id });
            if (errors.length > 0) {
                res.render("update-profile.html", {
                    user,
                    errors,
                    authenticated: req.authenticated,
                });
                return;
            }
            user.username = req.body.username;
            user.email = req.body.email;
            user.about = req.body.about;
            await user.save();
            res.redirect("/account");
        }
    );

router.post("/delete", async function (req, res) {
    // invalidate jwt
    const parsed = jwt.verify(cookie, process.env.SECRET);
    let data = await Jwt.findOne({ token: parsed.jwt_id });
    data.valid = false;
    await data.save();
    res.clearCookie("session");
    res.redirect("/");
    return;
});

router.get("/logout", async function (req, res) {
    // invalidate jwt
    const parsed = jwt.verify(req.cookies.session, process.env.SECRET);
    let data = await Jwt.findOne({ token: parsed.jwt_id });
    data.valid = false;
    await data.save();
    res.clearCookie("session");
    res.redirect("/");
    return;
});

module.exports = router;
