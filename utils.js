const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function generateSecretKey() {
    return crypto.randomBytes(256).toString("hex");
}

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

module.exports = { generateSecretKey, addSecretToEnv };
