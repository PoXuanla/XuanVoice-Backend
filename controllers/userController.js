const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getAllUser = async (req, res) => {
  const data = await User.find();
  res.status(200).json({
    data: {
      user: data,
    },
  });
};

exports.createUser = async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(409).json({
        status: "failed",
        message: "密碼未輸入或小於六個位元。",
      });
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create(req.body);
    const token = jwt.sign({ user_id: newUser.id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "7d",
    });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
        token: token,
      },
    });
  } catch (err) {
    if (err.code && err.code === 11000) {
      return res.status(200).json({
        status: "failed",
        message: {
          errors: {
            account: {
              message: "帳號已被使用",
            },
          },
        },
      });
    }
    res.status(200).json({
      status: "failed",
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;
    if (!account || !password)
      return res.json({
        status: "failed",
        message: "缺少參數",
      });
    const user = await User.findOne({ account });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          user_id: user.id,
        },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: "7d",
        }
      );
      return res.json({
        status: "success",
        user,
        token,
      });
    }
    res.json({
      status: "failed",
      message: "登入失敗",
    });
  } catch (err) {
    res.json({
      status: "failed",
      message: err,
    });
  }
};

exports.test = (req, res) => {
  res.json({
    status: "success",
    data: {
      userId: req.body.userId,
    },
  });
};
