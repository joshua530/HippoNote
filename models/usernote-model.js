const mongoose = require("mongoose");

const { Schema } = mongoose;

const userNoteSchema = new Schema({
    userId: mongoose.Types.ObjectId,
    noteId: mongoose.Types.ObjectId,
});

const UserNote = mongoose.Model("UserNote", userNoteSchema);
module.exports = UserNote;
