const mongoose = require('mongoose')

const songListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '必須要有名稱']
  },
  user: {
    type: mongoose.ObjectId,
    ref: 'users'
  },
  songs: [
    {
      type: mongoose.ObjectId,
      ref: 'songs'
    }
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false
  }
})
const SongList = mongoose.model('songlists', songListSchema)

module.exports = SongList
