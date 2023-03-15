const { addSecretToEnv } = require("../utils");
const { expect, assert } = require("chai");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

describe("Utility functions", function () {
    describe("addSecretToEnv", function () {
        it("Adds SECRET to .env if not present", function () {
            addSecretToEnv(__dirname);
            require("dotenv").config({
                path: path.resolve(__dirname, ".env"),
                debug: true,
            });
            assert.isTrue(fs.existsSync(path.resolve(__dirname, ".env")));
            assert.equal(process.env.SECRET.length, 512);
            fs.unlinkSync(path.resolve(__dirname, ".env"));
        });
    });
});
