import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    password: String,
    email: String,
    profilePicture: String,
    dateCreated: Date,
});

export default mongoose.Model("User", userSchema);
