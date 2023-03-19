const mongoose = require("mongoose");
const UserNote = require("./usernote-model");
const Note = require("./note-model");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: { type: String, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true },
        profilePicture: { type: String, required: true },
        dateCreated: { type: Date, default: Date.now },
    },
    {
        methods: {
            async getNotes() {
                const usernotes = await UserNote.find({ userId: this.id });
                let noteIds = usernotes.map((obj) => obj.noteId);
                let notes = await Note.find(
                    { _id: noteIds },
                    { title: 1, content: 1 }
                );
                return notes;
            },
        },
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
