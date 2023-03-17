const mongoose = require("mongoose");
const UserNote = require("./usernote-model");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: String,
        password: String,
        email: String,
        profilePicture: String,
        dateCreated: { type: Date, default: Date.now },
    },
    {
        methods: {
            async getNotes() {
                return await UserNote.find({ userId: this.id });
            },
        },
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
