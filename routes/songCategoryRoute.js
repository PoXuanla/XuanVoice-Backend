const express = require('express')
const router = express.Router()
const { getAllSongCategory, createSongCategory } = require('../controllers/songCategoryController')

router.route('/').get(getAllSongCategory)
module.exports = router
