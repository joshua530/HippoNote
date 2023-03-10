import mongoose from "mongoose";

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: Date,
    modified: Date,
    content: String,
});

const Note = mongoose.Model("Note", noteSchema);
export default Note;
