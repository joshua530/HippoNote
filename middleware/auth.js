const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    let cookie = req.cookies.session;
    if (!cookie) {
        res.redirect("/login");
        return;
    }

    try {
        jwt.verify(cookie, process.env.SECRET);
    } catch (e) {
        res.clearCookie("session");
        res.redirect("/login");
        return;
    }
    if (req.baseUrl === "/login" || req.baseUrl === "/sign-up") {
        res.redirect("/dashboard");
        return;
    }
    next();
}

module.exports = authenticate;
