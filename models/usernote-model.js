const mongoose = require("mongoose");

const { Schema } = mongoose;

const userNoteSchema = new Schema({
    userId: mongoose.Types.ObjectId,
    noteId: mongoose.Types.ObjectId,
});

const UserNote = mongoose.model("UserNote", userNoteSchema);
module.exports = UserNote;
