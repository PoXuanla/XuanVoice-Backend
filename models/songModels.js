const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '必須要有名稱'],
    minlength: [2, '名字不得小於兩個字']
  },
  author: {
    type: mongoose.ObjectId,
    ref: 'users'
  },
  image: {
    type: String
  },
  intro: {
    type: String
  },
  lyric: {
    type: String
  },
  songCategory: {
    type: mongoose.ObjectId,
    ref: 'songcategories'
  },
  mp3: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false
  }
})
const SongCategory = mongoose.model('songs', songSchema)

module.exports = SongCategory
