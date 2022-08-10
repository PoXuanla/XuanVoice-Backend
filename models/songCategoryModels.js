const mongoose = require('mongoose')

const songCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '必須要有名稱'],
    minlength: [2, '名字不得小於兩個字']
  },
})
const SongCategory = mongoose.model('songcategories', songCategorySchema)

module.exports = SongCategory
