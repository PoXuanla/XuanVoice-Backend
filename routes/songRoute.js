const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()

const {
  createSong,
  getSongByUser,
  getSongBySongId,
  deleteSongBySongId,
  updateSongBySongId
} = require('../controllers/songController')

router.route('/').post(upload.fields([{ name: 'mp3' }, { name: 'img' }]), createSong)
router
  .route('/:songId')
  .get(getSongBySongId)
  .delete(deleteSongBySongId)
  .patch(upload.fields([{ name: 'img' }]), updateSongBySongId)
module.exports = router
