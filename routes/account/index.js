const express = require("express");
const User = require("../../models/user-model");
const UserNote = require("../../models/usernote-model");
const { getUserIdFromCookie, hashPassword } = require("../../utils");
const router = express.Router();
const { body, query, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Jwt = require("../../models/jwt-model");
const Note = require("../../models/note-model");
const Token = require("../../models/token-model");
const uuid = require("uuid");

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
    const userId = getUserIdFromCookie(req);
    // delete all notes
    const userNotes = await UserNote.find({ userId });
    for (let userNote of userNotes) {
        await Note.deleteMany({ _id: userNote.noteId });
        await UserNote.deleteOne({ _id: userNote.id });
    }
    // delete user
    await User.deleteOne({ _id: userId });
    // invalidate jwt
    await invalidateJwt(req);
    res.clearCookie("session");
    res.redirect("/");
    return;
});

router.get("/logout", async function (req, res) {
    await invalidateJwt(req);
    res.clearCookie("session");
    res.redirect("/");
    return;
});

async function invalidateJwt(req) {
    const parsed = jwt.verify(req.cookies.session, process.env.SECRET);
    let data = await Jwt.findOne({ token: parsed.jwt_id });
    data.valid = false;
    await data.save();
}

router
    .route("/generate-reset-link")
    .get(function (req, res) {
        res.render("generate-reset-token.html", { title: "reset password" });
    })
    .post(body("email", "invalid email").isEmail(), async function (req, res) {
        const errors = validationResult(req).array();
        if (errors.length > 0) {
            res.render("generate-reset-token.html", {
                title: "reset password",
                errors,
                email: req.body.email,
            });
            return;
        }
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.render("generate-reset-token.html", {
                title: "reset password",
                errors: [{ msg: "invalid email" }],
                email: req.body.email,
            });
            return;
        }

        let token = await Token.findOne({ userId: user.id });
        if (token) {
            await token.deleteOne();
        }

        token = uuid.v4();
        await Token.create({
            userId: user.id,
            token,
            createdAt: Date.now(),
        });

        const link = `${process.env.HTTP_HOST}/reset-password?token=${token}`;
        // TODO sendEmail();
        res.render("generate-reset-token.html", {
            title: "reset password",
            message: "check your email for password reset token",
        });
    });

router
    .route("/reset-password")
    .get(
        query("token", "invalid token").trim().notEmpty(),
        async function (req, res) {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                res.render("reset-password.html", {
                    title: "reset password",
                    errors,
                });
                return;
            }

            const token = req.query.token;
            const savedTok = await Token.findOne({ token });
            if (!savedTok) {
                res.render("reset-password.html", {
                    title: "reset password",
                    errors: [{ msg: "invalid token" }],
                });
                return;
            }
            res.render("reset-password.html", {
                title: "reset password",
                token,
            });
        }
    )
    .post(
        query("token", "invalid token").trim().notEmpty(),
        body("password")
            .trim()
            .isLength({ min: 8 })
            .withMessage("password should be at least 8 characters long"),
        body("password2", "passwords do not match").custom(
            (value, { req }) => value === req.body.password
        ),
        async function (req, res) {
            const token = req.query.token;
            const savedTok = await Token.findOne({ token });
            if (!savedTok) {
                res.render("reset-password.html", {
                    title: "reset password",
                    errors: [{ msg: "invalid token" }],
                });
                return;
            }
            const user = await User.findOne({ _id: savedTok.userId });

            if (!user) {
                res.render("reset-password.html", {
                    title: "reset password",
                    errors: [{ msg: "invalid token" }],
                });
                return;
            }
            user.password = hashPassword(req.body.password);
            await user.save();
            await Token.findByIdAndDelete(savedTok.id);
            res.render("reset-password.html", {
                title: "reset password",
                message: "password reset successfully",
            });
        }
    );

module.exports = router;
