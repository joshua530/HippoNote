const mongoose = require("mongoose");

const { Schema } = mongoose;

const jwtSchema = new Schema({
    token: { type: String, required: true },
    valid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 3600 * 24 * 10 },
});

const Jwt = mongoose.model("Jwt", jwtSchema);
module.exports = Jwt;
