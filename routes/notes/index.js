const express = require("express");
const { loggedIn, getUserIdFromCookie } = require("../../utils");
const router = express.Router();
const { body } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const Note = require("../../models/note-model");
const UserNote = require("../../models/usernote-model");

/**
 * route: /notes
 */
router.get("/", function (req, res) {});

router.get("/search", function (req, res) {});

router
    .route("/new")
    .get(function (req, res) {
        res.render("create-note.html", { title: "create note" });
    })
    .post(
        body("text").not().isEmpty().trim(),
        body("title").not().isEmpty().trim().escape(),
        async function (req, res) {
            if (!loggedIn(req)) {
                res.redirect("/login");
                return;
            }
            // sanitize
            const userId = getUserIdFromCookie(req);
            const cleanedText = sanitizeHtml(req.body.text, {
                allowedTags: ["img"],
                allowedAttributes: {
                    img: [
                        "src",
                        "srcset",
                        "alt",
                        "title",
                        "width",
                        "height",
                        "loading",
                    ],
                },
            });

            const note = await Note.create({
                title: req.body.title,
                content: cleanedText,
            });
            if (!note) {
                res.render("create-note.html", {
                    title: "create note",
                    text: req.body.text,
                    message:
                        "could not create note at this time, please try again later",
                });
                return;
            }

            const userNote = await UserNote.create({
                userId,
                noteId: note.id,
            });
            if (!userNote) {
                await Note.findOneAndDelete({ _id: note.id });
                res.render("create-note.html", {
                    title: "create note",
                    text: req.body.text,
                    message:
                        "could not create note at this time, please try again later",
                });
                return;
            }

            res.redirect("/dashboard");
        }
    );

router
    .route("/new")
    .get(function (req, res) {})
    .post(function (req, res) {});

module.exports = router;
