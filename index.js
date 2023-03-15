const express = require("express");
const { addSecretToEnv } = require("./utils");
const app = express();

addSecretToEnv();

app.use("/", require("./routes"));
app.use("/notes", require("./routes/notes"));
app.use("/account", require("./routes/account"));
app.use("/api/v1", require("./routes/api"));
app.use("*", function (req, res) {
    res.set("Content-Type", "application/json");
    res.send({ error: "404 not found" });
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server started. Listening on port ${port}`);
});
