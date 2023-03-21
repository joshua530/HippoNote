function errorhandler(err, req, res, next) {
    if (err) {
        res.redirect("/500");
        return;
    }
    next();
}

module.exports = errorhandler;
