const mongoose = require("mongoose");

const { Schema } = mongoose;

const jwtSchema = new Schema({
    token: { type: String, required: true },
    valid: { type: Boolean, default: false },
});

const Jwt = mongoose.model("Jwt", jwtSchema);
module.exports = Jwt;
