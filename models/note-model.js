import mongoose from "mongoose";

const { Schema } = mongoose;

const noteSchema = new Schema({
    created: Date,
    modified: Date,
    content: String,
});

export default mongoose.Model("Note", noteSchema);
