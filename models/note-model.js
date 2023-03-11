const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: Date,
    modified: Date,
    content: String,
});

const Note = mongoose.Model("Note", noteSchema);
module.exports = Note;
