const { expect } = require("chai");
const mongoose = require("mongoose");
const request = require("request");
const connection = require("../../db");
const User = require("../../models/user-model");
const { hashPassword } = require("../../utils");

const port = process.env.PORT || 5000;
const host = "127.0.0.1";
describe("Index routes", function () {
    describe("Home page", function () {
        it("Renders correctly", function () {
            request.get(`http://${host}:${port}/`, (err, res, body) => {
                expect(body).to.contain("home page");
                expect(body).to.contain("Hippo note");
            });
        });
    });
    describe("Login page", function () {
        before(async function () {
            process.env["DB_URI"] = "mongodb://127.0.0.1:27017/hippo_note_test";
            await connection();
            await User.create({
                username: "abc",
                password: hashPassword("abc"),
                email: "a@email.com",
                profilePicture: "/a.jpg",
            });
        });
        after(async function () {
            await mongoose.connection.close();
        });
        it("Renders correctly", function () {
            request.get(`http://${host}:${port}/login`, (err, res, body) => {
                expect(body).to.contain("login page");
                expect(body).to.contain("Login");
            });
        });
        it("Returns error message on missing username", function () {
            request.post(
                {
                    url: `http://${host}:${port}/login`,
                    form: { password: "ab" },
                },
                (err, res, body) => {
                    expect(res.statusCode).to.be.equal(400);
                    expect(body).to.contain(
                        "username and password cannot be empty"
                    );
                }
            );
        });
        it("Returns error message on missing password", function () {
            request.post(
                {
                    url: `http://${host}:${port}/login`,
                    form: { password: "ab" },
                },
                (err, res, body) => {
                    expect(res.statusCode).to.be.equal(400);
                    expect(body).to.contain(
                        "username and password cannot be empty"
                    );
                }
            );
        });
        it("Returns error message for wrong credentials", function () {
            request.post(
                {
                    url: `http://${host}:${port}/login`,
                    form: { username: "abcde", password: "ab" },
                },
                (err, res, body) => {
                    expect(res.statusCode).to.be.equal(400);
                    expect(body).to.contain("invalid username or password");
                }
            );
        });
        it("Returns 302 redirect for correct credentials", async function () {
            request.post(
                {
                    url: `http://${host}:${port}/login`,
                    form: { username: "abc", password: "abc" },
                },
                (err, res, body) => {
                    expect(res.statusCode).to.be.equal(302);
                }
            );
        });
    });
    describe("Sign up page", function () {
        it("Renders correctly", function () {
            request.get(`http://${host}:${port}/sign-up`, (err, res, body) => {
                expect(body).to.contain("sign up");
                expect(body).to.contain("Create an account");
            });
        });
    });
});
