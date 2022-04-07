const express = require("express");
const dotenv = require("dotenv");
const userRoute = require("./routes/userRoute");
const app = express();

dotenv.config({ path: "./config.env" });
//MiddleWare
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//Router
app.use("/api/v1/users", userRoute);

module.exports = app;
