const connection = require("../../db");
const User = require("../../models/user-model");
const Note = require("../../models/note-model");
const { default: mongoose } = require("mongoose");
const { expect } = require("chai");
const UserNote = require("../../models/usernote-model");

describe("User Model", function () {
    before(async function () {
        await connection();
    });
    after(function () {
        mongoose.connection.close();
    });
    it("Returns associated user notes", async function () {
        const user = await User.create({
            password: "abc",
            email: "a@email.com",
            profilePicture: "/a.jpg",
        });
        if (!user.id) expect(1).to.be.equal(0, "User creation failed");
        const note = await Note.create({
            content: "note",
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
