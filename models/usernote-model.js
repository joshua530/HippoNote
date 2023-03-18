const mongoose = require("mongoose");

const { Schema } = mongoose;

const userNoteSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    noteId: { type: mongoose.Types.ObjectId, required: true },
});

const UserNote = mongoose.model("UserNote", userNoteSchema);
module.exports = UserNote;
