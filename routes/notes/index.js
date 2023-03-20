const express = require("express");
const { loggedIn, getUserIdFromCookie } = require("../../utils");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const Note = require("../../models/note-model");
const UserNote = require("../../models/usernote-model");
const { isValidObjectId } = require("mongoose");

/**
 * route: /notes
 */
router.get("/search", async function (req, res) {
    const query = req.query.q;
    if (!query || typeof query !== "string" || query.trim() === "") {
        res.render("/dashboard", {
            title: "dashboard",
            authenticated: req.authenticated,
        });
        return;
    }
    const userId = getUserIdFromCookie(req);
    q = query.trim();
    const userNotes = await UserNote.find({ userId: userId });
    if (!userNotes) {
        res.render("dashboard.html", {
            title: "dashboard",
            notes: [],
            message: "No notes matched the query",
            authenticated: req.authenticated,
        });
    }
    const noteIds = userNotes.map((note) => note.noteId);
    const notes = await Note.find()
        .and({
            _id: { $in: noteIds },
        })
        .and({
            $or: [
                { title: new RegExp(q, "i") },
                { content: new RegExp(q, "i") },
            ],
        });

    res.render("dashboard.html", {
        title: "dashboard",
        notes,
        message: "No notes matched the query",
        authenticated: req.authenticated,
    });
});

router
    .route("/new")
    .get(function (req, res) {
        res.render("create-note.html", {
            title: "create note",
            authenticated: req.authenticated,
        });
    })
    .post(
        body("title", "invalid title").not().isEmpty().trim().escape(),
        body("text", "invalid content").not().isEmpty().trim(),
        async function (req, res) {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                res.render("create-note.html", {
                    errors,
                    title: req.body.title,
                    text: req.body.text,
                    authenticated: req.authenticated,
                });
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
                    errors: [
                        {
                            msg: "could not save note at this time, please try again later",
                        },
                    ],
                    authenticated: req.authenticated,
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
                    errors: [
                        {
                            msg: "could not save note at this time, please try again later",
                        },
                    ],
                    authenticated: req.authenticated,
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
        if (!isValidObjectId(id)) {
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
        res.render("edit-note.html", {
            title: "view note",
            note,
            authenticated: req.authenticated,
        });
    })
    .post(
        body("title", "invalid title").not().isEmpty().trim().escape(),
        body("text", "invalid content").not().isEmpty().trim(),
        async function (req, res) {
            const errors = validationResult(req).array();
            if (errors.length > 0) {
                res.render("edit-note.html", {
                    errors,
                    note: {
                        title: req.body.title,
                        text: req.body.text,
                        id: req.params.id,
                    },
                    authenticated: req.authenticated,
                });
                return;
            }
            let id = req.params.id;
            if (!isValidObjectId(id)) {
                res.redirect("/404");
                return;
            }

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
                        authenticated: req.authenticated,
                    },
                    errors: [
                        {
                            msg: "could not save note at this time, please try again later",
                        },
                    ],
                });
            }
        }
    );

router.post("/delete/:id", async function (req, res) {
    let id = req.params.id;
    if (!isValidObjectId(id)) {
        res.redirect("/404");
        return;
    }
    let userNote = await UserNote.findOne({ noteId: id });
    if (!userNote) {
        res.redirect("/404");
        return;
    }
    if (userNote.userId.toString() !== getUserIdFromCookie(req)) {
        res.redirect("/403");
        return;
    }
    await Note.deleteOne({ _id: id });
    await UserNote.deleteOne({ noteId: id });
    res.redirect("/dashboard");
});

router.get("/:id", async function (req, res) {
    let id = req.params.id;
    if (!isValidObjectId(id)) {
        res.redirect("/404");
        return;
    }

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
    res.render("view-note.html", { note, authenticated: req.authenticated });
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
            a: ["href"],
        },
    });
}

module.exports = router;
