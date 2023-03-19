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
            const cleanedText = sanitizeWYSIWYG(req.body.text);

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
    .route("/edit/:id")
    .get(async function (req, res) {
        let id = req.params.id;
        if (!id) {
            res.redirect("/404");
            return;
        }

        let note = await Note.findOne({ _id: id });
        if (!note) {
            res.redirect("/404");
            return;
        }

        let userNote = await UserNote.findOne({ noteId: note.id });
        if (userNote.userId.toString() !== getUserIdFromCookie(req)) {
            res.redirect("/403");
            return;
        }
        res.render("edit-note.html", { title: "view note", note });
    })
    .post(
        body("text").not().isEmpty().trim(),
        body("title").not().isEmpty().trim().escape(),
        async function (req, res) {
            let id = req.params.id;
            let userNote = await UserNote.findOne({ noteId: id });
            if (!userNote) {
                res.redirect("/404");
                return;
            }
            if (userNote.userId.toString() !== getUserIdFromCookie(req)) {
                res.redirect("/403");
                return;
            }
            const cleanedText = sanitizeWYSIWYG(req.body.text);
            try {
                await Note.updateOne(
                    { _id: userNote.noteId },
                    { $set: { title: req.body.title, content: cleanedText } }
                );
                res.redirect(`/notes/${id}`);
            } catch (e) {
                res.render("edit-note.html", {
                    title: "view note",
                    note: {
                        id,
                        title: req.body.title,
                        content: req.body.content,
                    },
                    message:
                        "could not save note at given time, please try again later",
                });
            }
        }
    );

router.post("/delete/:id", function (req, res) {});

router.get("/:id", async function (req, res) {
    let id = req.params.id;
    let userNote = await UserNote.findOne({ noteId: id });
    if (!userNote) {
        res.redirect("/404");
        return;
    }
    if (userNote.userId.toString() !== getUserIdFromCookie(req)) {
        res.redirect("/403");
        return;
    }
    let note = await Note.findOne(
        { _id: userNote.noteId },
        { title: 1, content: 1 }
    );
    if (!note) {
        res.redirect("/404");
        return;
    }
    res.render("view-note.html", { note });
});

function sanitizeWYSIWYG(text) {
    return sanitizeHtml(text, {
        allowedTags: [
            "img",
            "address",
            "article",
            "aside",
            "footer",
            "header",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "hgroup",
            "main",
            "nav",
            "section",
            "blockquote",
            "dd",
            "div",
            "dl",
            "dt",
            "figcaption",
            "figure",
            "hr",
            "li",
            "main",
            "ol",
            "p",
            "pre",
            "ul",
            "a",
            "abbr",
            "b",
            "bdi",
            "bdo",
            "br",
            "cite",
            "code",
            "data",
            "dfn",
            "em",
            "i",
            "kbd",
            "mark",
            "q",
            "rb",
            "rp",
            "rt",
            "rtc",
            "ruby",
            "s",
            "samp",
            "small",
            "span",
            "strong",
            "sub",
            "sup",
            "time",
            "u",
            "var",
            "wbr",
            "caption",
            "col",
            "colgroup",
            "table",
            "tbody",
            "td",
            "tfoot",
            "th",
            "thead",
            "tr",
        ],
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
}

module.exports = router;
