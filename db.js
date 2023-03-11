const mongoose = require("mongoose");

const PORT = process.env["PORT"] || 27017;
const HOST = process.env["HOST"] || "127.0.0.1";
const DB = process.env["DB"] || "hippo_note";
let DB_URI = process.env["DB_URI"] || null;

if (!DB_URI) {
    DB_URI = `mongodb://${HOST}:${PORT}/${DB}`;
}

const connection = async function () {
    try {
        const conn = await mongoose.connect(DB_URI, { autoIndex: false });
        console.log(`DB connected to ${conn.connection.host} successfully`);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};

module.exports = connection;
