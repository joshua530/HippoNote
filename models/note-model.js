const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    title: String,
    content: String,
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
