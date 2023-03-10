import mongoose from "mongoose";
import UserNote from "./usernote-model";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        password: String,
        email: String,
        profilePicture: String,
        dateCreated: Date,
    },
    {
        methods: {
            getNotes() {
                return UserNote.find({ id: this.id });
            },
        },
    }
);

const User = mongoose.Model("User", userSchema);
export default User;
