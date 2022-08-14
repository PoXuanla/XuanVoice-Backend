const express = require('express')
const {
  getAllUser,
  createUser,
  login,
  test,
  getSongByUser,
  getUserInform
} = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer')
const upload = multer()
const router = express.Router()

router.route('/').get(getAllUser).post(upload.single('image'), createUser)
router.route('/login').post(login)
router.route('/userInform/:account').get(getUserInform)

router.use(authMiddleware) //valid token

router.route('/songs').get(getSongByUser)
router.route('/test').get(test)
module.exports = router
