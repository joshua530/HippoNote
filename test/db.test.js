const { default: mongoose } = require("mongoose");
const connection = require("../db");
const { expect } = require("chai");

describe("Db connector", function () {
    afterEach(async function () {
        await mongoose.connection.close();
    });
    it("Should connect to local database when DB_URI isn't provided", async function () {
        process.env.DB_URI = 0;
        process.env["PORT"] = 27017;
        process.env["HOST"] = "127.0.0.1";
        process.env["DB"] = "hippo_note_test";
        await connection();
        expect(mongoose.connection.readyState).to.be.equal(1);
    });
    it("Should connect to database using DB_URI when provided", async function () {
        process.env["DB_URI"] = "mongodb://127.0.0.1:27017/hippo_note_test";
        process.env["PORT"] = null;
        process.env["HOST"] = null;
        process.env["DB"] = null;
        await connection();

        expect(mongoose.connection.readyState).to.be.equal(1);
    });
});
