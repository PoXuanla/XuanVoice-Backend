const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()

const {
  createSong,
  getSongByUser,
  getSongBySongId,
  deleteSongBySongId,
  updateSongBySongId,
  getBrowseSongs
} = require('../controllers/songController')
const authMiddleware = require('../middleware/authMiddleware')

router.route('/category/:categoryId/order/:orderStr').get(getBrowseSongs)

router.use(authMiddleware) //valid token

router.route('/').post(upload.fields([{ name: 'mp3' }, { name: 'img' }]), createSong)

router
  .route('/:songId')
  .get(getSongBySongId)
  .delete(deleteSongBySongId)
  .patch(upload.fields([{ name: 'img' }]), updateSongBySongId)
  
module.exports = router
