const express = require('express')
const {
  getAllUser,
  createUser,
  login,
  getTokenData,
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

router.route('/tokenData').get(getTokenData)
router.route('/songs').get(getSongByUser)
module.exports = router
