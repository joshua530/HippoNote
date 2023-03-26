function headers(req, res, next) {
    res.header(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.ckeditor.com *.cloudflare.com *.jsdelivr.net *.fontawesome.com; style-src 'self' 'unsafe-inline' *.cloudflare.com *.fontawesome.com fonts.googleapis.com unsafe-inline; img-src *; font-src *; media-src *; object-src 'none'; frame-src 'none'; base-uri 'self'"
    );
    next();
}

module.exports = headers;
