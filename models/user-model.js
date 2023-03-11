const mongoose = require("mongoose");
const UserNote = require("./usernote-model");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        password: String,
        email: String,
        profilePicture: String,
        dateCreated: { type: Date, default: Date.now },
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
module.exports = User;
