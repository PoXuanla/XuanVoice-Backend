const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "必須要有名字"],
    minlength: [2, "名字不得小於兩個字"],
  },
  account: {
    type: String,
    required: [true, "必須要有帳號"],
    minlength: [6, "帳號不得小於六個字"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "必須要有密碼"],
    minlength: [6, "密碼不得小於六個字"],

  },
  intro: {
    type: String,
    max: [50],
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false,
  },
});
const User = mongoose.model("user", userSchema);

module.exports = User;
