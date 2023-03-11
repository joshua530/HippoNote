const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: Date,
    modified: Date,
    content: String,
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
