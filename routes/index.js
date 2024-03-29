const express = require("express");
const User = require("../models/user-model");
const router = express.Router();
const { verifyPassword, generateImageUri, hashPassword } = require("../utils");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const uuid = require("uuid");
const Jwt = require("../models/jwt-model");

/**
 * route: /
 */
router.get("/", function (req, res) {
    res.render("index.html", {
        title: "home page",
        authenticated: req.authenticated,
    });
});

router.get("/404", function (req, res) {
    res.status(404);
    res.render("404.html");
});

router.get("/403", function (req, res) {
    res.status(403);
    res.render("403.html");
});

router.get("/500", function (req, res) {
    res.status(500);
    res.render("500.html");
});

router
    .route("/login")
    .get(function (req, res) {
        res.render("login.html", {
            title: "login page",
            authenticated: req.authenticated,
        });
    })
    .post(
        body("password", "invalid credentials").not().isEmpty().trim().escape(),
        body("username", "invalid credentials").not().isEmpty().trim().escape(),
        async function (req, res) {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                res.render("login.html", {
                    errors,
                    username: req.body.username,
                    password: req.body.password,
                    authenticated: req.authenticated,
                });
                return;
            }
            const { username, password } = req.body;
            const user = await User.findOne({ username: username }).exec();
            if (!user || !verifyPassword(password, user.password)) {
                res.status(400);
                res.render("login.html", {
                    title: "login page",
                    errors: [{ msg: "invalid credentials" }],
                    authenticated: req.authenticated,
                });
                return;
            }
            const id = uuid.v4();
            const tmpTok = await Jwt.create({ token: id, valid: true });
            if (!tmpTok) {
                res.status(500);
                res.render("login.html", {
                    title: "login page",
                    errors: [
                        {
                            msg: "we cannot log you in at this time, try again later",
                        },
                    ],
                    authenticated: req.authenticated,
                });
                return;
            }
            const cookie = jwt.sign(
                { id: user.id, jwt_id: id },
                process.env.SECRET,
                {
                    expiresIn: "10d",
                }
            );

            res.cookie("session", cookie, {
                httpOnly: true,
                secure: true,
                sameSite: true,
                expires: new Date(Date.now() + 60000 * 60 * 24 * 10),
            });
            res.redirect("/dashboard");
        }
    );

router
    .route("/sign-up")
    .get(function (req, res) {
        res.render("sign-up.html", {
            title: "sign up",
            authenticated: req.authenticated,
        });
    })
    .post(
        body("username", "invalid username").not().isEmpty().trim().escape(),
        body("email", "invalid email").isEmail(),
        body("password", "invalid password")
            .not()
            .isEmpty()
            .trim()
            .escape()
            .isLength({ min: 8 })
            .withMessage("password should be 8 characters or more"),
        body("password2", "passwords do not match").custom(
            (value, { req }) => value === req.body.password
        ),
        async function (req, res) {
            let { username, password, email } = req.body;
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                res.render("sign-up.html", {
                    errors,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    password2: req.body.password2,
                    authenticated: req.authenticated,
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
                    authenticated: req.authenticated,
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
                    authenticated: req.authenticated,
                });
                return;
            }
            let user = await User.create({
                username,
                password: hashPassword(password),
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
                    authenticated: req.authenticated,
                });
            } else {
                res.status(400);
                res.render("sign-up.html", {
                    title: "sign up",
                    message: {
                        text: "error occured while creating user, please try again later",
                        type: "danger",
                    },
                    username,
                    email,
                    authenticated: req.authenticated,
                });
            }
        }
    );

router.get("/dashboard", async function (req, res) {
    // get cookie
    let cookie = req.cookies.session;
    let decoded;
    try {
        decoded = jwt.verify(cookie, process.env.SECRET);
    } catch (e) {
        res.clearCookie("session");
        res.redirect("/login");
        return;
    }
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
        res.clearCookie("session");
        res.redirect("/login");
        return;
    }
    const notes = await user.getNotes();
    for (let note of notes) {
        if (note.content.length > 30)
            note.content = note.content.slice(0, 30) + "...";
    }
    res.render("dashboard.html", {
        title: "dashboard",
        notes,
        authenticated: req.authenticated,
    });
});

module.exports = router;
