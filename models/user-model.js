const mongoose = require("mongoose");
const UserNote = require("./usernote-model");

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: { type: String, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true },
        profilePicture: { type: String, required: true },
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
