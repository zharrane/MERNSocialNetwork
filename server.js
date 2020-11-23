const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const connetToDatabase = require("./config/db");

//Routes
const usersRoute = require("./routes/api/users");
const profilesRoute = require("./routes/api/profiles");
const postsRoute = require("./routes/api/posts");
const authRoute = require("./routes/api/auth");

//Starting App
const app = express();

//body Parser Middleware
app.use(express.json({ extended: false }));

//Connect to mongoDb by mongoose
connetToDatabase();

//Using routes

app.use("/api/users", usersRoute);
app.use("/api/profiles", profilesRoute);
app.use("/api/posts", postsRoute);
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
