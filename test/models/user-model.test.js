const connection = require("../../db");
const User = require("../../models/user-model");
const Note = require("../../models/note-model");
const { default: mongoose } = require("mongoose");
const { expect } = require("chai");
const UserNote = require("../../models/usernote-model");
const { hashPassword } = require("../../utils");

describe("User Model", function () {
    before(async function () {
        process.env.DB_URI = "mongodb://127.0.0.1:27017/hippo_note_test";
        await connection();
    });
    after(function () {
        mongoose.connection.close();
        process.env.DB_URI = "";
    });
    it("Returns associated user notes", async function () {
        const user = await User.create({
            username: "abc",
            password: hashPassword("abc"),
            email: "a@email.com",
            profilePicture: "/a.jpg",
        });
        if (!user.id) expect(1).to.be.equal(0, "User creation failed");
        const note = await Note.create({
            content: "note",
            title: "title",
        });
        if (!note.id) expect(1).to.be.equal(0, "Note creation failed");
        const userNote = await UserNote.create({
            userId: user.id,
            noteId: note.id,
        });
        if (!userNote.id) expect(1).to.be.equal(0, "User note creation failed");
        const userNotes = await user.getNotes();
        expect(userNotes[0].id).to.be.equal(userNote.id);
    });
});
