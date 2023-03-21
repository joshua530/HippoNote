const express = require("express");
const { addSecretToEnv } = require("./utils");
const app = express();
const twig = require("twig");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connection = require("./db");
const authenticate = require("./middleware/auth");
const headers = require("./middleware/headers");
const errorhandler = require("./middleware/errorhandler");

addSecretToEnv();
connection(true);

app.set("views", "./templates");
app.set("view engine", "twig");
app.engine("html", twig.__express);

app.use(cookieParser());
app.use("/static", express.static("public"));
app.use(
    ["/notes", "/account", "/dashboard", "/login", "/sign-up", "/"],
    authenticate
);
app.use(headers);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorhandler);
app.use("/robots.txt", function (req, res) {
    res.type("text/plain");
    res.send("User-Agent: *\nDisallow: /");
});
app.use("/", require("./routes"));
app.use("/notes", require("./routes/notes"));
app.use("/account", require("./routes/account"));
app.use("*", function (req, res) {
    res.render("404.html");
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server started. Listening on port ${port}`);
});
