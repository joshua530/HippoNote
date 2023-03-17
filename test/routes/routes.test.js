const { expect } = require("chai");
const request = require("request");

const port = process.env.PORT || 5000;
describe("Index routes", function () {
    describe("Home page", function () {
        it("Renders correctly", function () {
            request.get(`http://127.0.0.1:${port}/`, (err, res, body) => {
                expect(body).to.contain("home page");
                expect(body).to.contain("Hippo note");
            });
        });
    });
    describe("Login page", function () {
        it("Renders correctly", function () {
            request.get(`http://127.0.0.1:${port}/login`, (err, res, body) => {
                expect(body).to.contain("login page");
                expect(body).to.contain("Login");
            });
        });
    });
    describe("Sign up page", function () {
        it("Renders correctly", function () {
            request.get(
                `http://127.0.0.1:${port}/sign-up`,
                (err, res, body) => {
                    expect(body).to.contain("sign up");
                    expect(body).to.contain("Create an account");
                }
            );
        });
    });
});
