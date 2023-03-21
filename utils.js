const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { MailtrapClient } = require("mailtrap");

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
    require("dotenv").config({
        path: path.resolve(basePath, ".env"),
    });
    if (!process.env.SECRET) {
        const secret = generateSecretKey();
        const secretStr = `SECRET="${secret}"\n`;
        const filePath = path.resolve(basePath, ".env");
        let file = fs.openSync(filePath, "a");
        fs.writeSync(file, secretStr);
        fs.close(file);
    }
}

/** auth */
function getUserIdFromCookie(req) {
    return jwt.verify(req.cookies.session, process.env.SECRET).id;
}

/** more utils */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateImageUri() {
    let uri = `/static/img/profile/${getRandomInt(1, 10)}.png`;
    return uri;
}

function sendEmail(to, from, subject, content) {
    const TOKEN = process.env.MAILTRAP_API_KEY;
    const ENDPOINT = "https://send.api.mailtrap.io/";

    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

    const sender = {
        email: "mailtrap@jjweb.tech",
        name: "Mailtrap Test",
    };
    const recipients = [
        {
            email: "joshuaomari5@gmail.com",
        },
    ];

    client
        .send({
            from: sender,
            to: recipients,
            subject: "You are awesome!",
            text: "Congrats for sending test email with Mailtrap!",
            category: "Integration Test",
        })
        .then(console.log, console.error);
}

module.exports = {
    generateSecretKey,
    addSecretToEnv,
    hashPassword,
    verifyPassword,
    generateImageUri,
    getUserIdFromCookie,
    sendEmail,
};
