const express = require("express");
const { addSecretToEnv } = require("./utils");
const app = express();
const twig = require("twig");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connection = require("./db");

addSecretToEnv();
connection(true);

app.set("views", "./templates");
app.set("view engine", "twig");
app.engine("html", twig.__express);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static("public"));
app.use("/", require("./routes"));
app.use("/notes", require("./routes/notes"));
app.use("/account", require("./routes/account"));
app.use("*", function (req, res) {
    res.set("Content-Type", "application/json");
    res.send({ error: "404 not found" });
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server started. Listening on port ${port}`);
});
