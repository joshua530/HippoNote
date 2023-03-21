const jwt = require("jsonwebtoken");
const Jwt = require("../models/jwt-model");

async function authenticate(req, res, next) {
    let cookie = req.cookies.session;
    req.authenticated = false;
    try {
        const parsed = jwt.verify(cookie, process.env.SECRET);
        const data = await Jwt.findOne({ token: parsed.jwt_id });
        // invalid token
        if (!data || !data.valid) {
            throw new Exception();
        }
        if (req.baseUrl === "/sign-up" || req.baseUrl === "/login") {
            res.redirect("/dashboard");
            return;
        }
        req.authenticated = true;
    } catch (e) {
        if (
            req.baseUrl !== "/login" &&
            req.baseUrl !== "/sign-up" &&
            req.baseUrl !== "/" &&
            req.baseUrl !== ""
        ) {
            res.clearCookie("session");
            res.redirect("/login");
            return;
        }
    }
    next();
}

module.exports = authenticate;
