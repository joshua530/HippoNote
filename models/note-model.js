const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    title: { type: String, required: true },
    content: { type: String, required: true },
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
