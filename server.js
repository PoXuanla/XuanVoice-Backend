const app = require("./app");
const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });

const port = 3000;
app.listen(port, () => {
  console.log("App running on port 3000");
});
