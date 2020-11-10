const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

const app = express();

// DB config
const databaseConnectionUri = require("./config/keys").mongoURI;
//Connect to mongoDb by mongoose
mongoose
  .connect(databaseConnectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log("Failed to connect "));
app.get("/", (req, res) => res.send("Hello !qwe"));

//Using routes

app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Running on port ${port}`));
