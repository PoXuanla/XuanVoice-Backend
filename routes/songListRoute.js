const express = require('express')
const router = express.Router()

const {
  createList,
  deleteList,
  getListByUserId,
  patchListData,
  getListsAndCheckSongExistList,
  getListSongs, testGetSongs,
  replaceSongOrder,
  replaceSortMode
} = require('../controllers/songListController')

const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware) //valid token

router.route('/').post(createList)
router.route('/userSongList').get(getListByUserId)

router.route('/:songListId').get(getListSongs).patch(patchListData).delete(deleteList)
router.route('/:songListId/songs').put(replaceSongOrder)

router.route('/:songListId/sortMode').put(replaceSortMode)

router.route('/userSongList/exist/:songId').get(getListsAndCheckSongExistList)

module.exports = router
