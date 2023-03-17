const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/** crypto */
function generateSecretKey() {
    return generateToken(256);
}

function generateSalt(length = 16) {
    return generateToken(length);
}

function generateToken(length) {
    return crypto.randomBytes(length).toString("hex");
}

function hashPassword(password) {
    const salt = generateSalt();
    const hash = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");
    return `${hash}:${salt}`;
}

function verifyPassword(password, hash) {
    const [hashed, salt] = hash.split(":");
    const tmp = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");
    return tmp === hashed;
}

/** environment variables */
function addSecretToEnv(basePath = "") {
    if (!basePath) basePath = __dirname;
    if (!process.env.SECRET) {
        const secret = generateSecretKey();
        const secretStr = `SECRET="${secret}"\n`;
        const filePath = path.resolve(basePath, ".env");
        let file = fs.openSync(filePath, "a");
        fs.writeSync(file, secretStr);
        fs.close(file);
    }
}

module.exports = {
    generateSecretKey,
    addSecretToEnv,
    hashPassword,
    verifyPassword,
};
