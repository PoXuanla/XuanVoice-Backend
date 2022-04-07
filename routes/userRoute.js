const express = require("express");
const { getAllUser, createUser, login, test } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.route("/").get(getAllUser).post(createUser);
router.route("/login").post(login);

router.use(authMiddleware); //valid auth
router.route("/test").get(test);
module.exports = router;
