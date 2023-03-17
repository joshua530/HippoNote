const mongoose = require("mongoose");

function constructDbURI() {
    const PORT = process.env["PORT"] || 27017;
    const HOST = process.env["HOST"] || "127.0.0.1";
    const DB = process.env["DB"] || "hippo_note";
    let DB_URI = process.env["DB_URI"] || null;

    if (!DB_URI || parseInt(DB_URI) === 0)
        DB_URI = `mongodb://${HOST}:${PORT}/${DB}`;
    return DB_URI;
}

const connection = async function (printConnectionMessage = false) {
    const DB_URI = constructDbURI();
    try {
        const conn = await mongoose.connect(DB_URI, { autoIndex: false });
        printConnectionMessage &&
            console.log(`DB connected to ${conn.connection.host} successfully`);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
};

module.exports = connection;
