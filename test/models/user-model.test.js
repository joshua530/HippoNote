const connection = require("../../db");
const User = require("../../models/user-model");
const Note = require("../../models/note-model");
const { default: mongoose } = require("mongoose");
const { expect } = require("chai");
const UserNote = require("../../models/usernote-model");

describe("User Model", function () {
    before(async function () {
        await connection();
        process.env.DB_URI = "hippo_note_test";
    });
    after(function () {
        mongoose.connection.close();
        process.env.DB_URI = "";
    });
    it("Returns associated user notes", async function () {
        const user = await User.create({
            username: "abc",
            password: "abc",
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
