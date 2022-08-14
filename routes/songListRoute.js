const express = require('express')
const router = express.Router()

const {
  createSongList,
  deleteSongListById,
  findSongListsByUserId,
  updateSongInList
} = require('../controllers/songListController')

const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware) //valid token

router.route('/').post(createSongList)
router.route('/:songListId').patch(updateSongInList).delete(deleteSongListById)
router.route('/userSongList').get(findSongListsByUserId)
module.exports = router
