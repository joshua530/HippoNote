import mongoose from "mongoose";

const { Schema } = mongoose;

const userNoteSchema = new Schema({
    userId: mongoose.Types.ObjectId,
    noteId: mongoose.Types.ObjectId,
});

export default mongoose.Model("UserNote", userNoteSchema);
