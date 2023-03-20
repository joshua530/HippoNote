const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    let cookie = req.cookies.session;

    try {
        jwt.verify(cookie, process.env.SECRET);
        if (req.baseUrl === "/sign-up" || req.baseUrl === "/login") {
            res.redirect("/dashboard");
            return;
        }
    } catch (e) {
        if (req.baseUrl !== "/login" && req.baseUrl !== "/sign-up") {
            res.clearCookie("session");
            res.redirect("/login");
            return;
        }
    }

    next();
}

module.exports = authenticate;
