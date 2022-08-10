const SongCategory = require('../models/songCategoryModels')

exports.getAllSongCategory = async (req, res) => {
  const data = await SongCategory.find()
  res.status(200).json({
    SongCategory: data
  })
}
