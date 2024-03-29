const mongoose = require('mongoose')

const songListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '必須要有名稱'],
    unique: true,
    index: true
  },
  user: {
    type: mongoose.ObjectId,
    ref: 'users'
  },
  songs: [
    {
      songId: { type: mongoose.ObjectId, ref: 'songs' },
      order: { type: Number, required: true, default: 0 },
      createdAt: { type: Date, default: Date.now() }
    }
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: false
  },
  orderBy: {
    type: String,
    default: 'createdAt',
    required: true
  },
  sort: {
    type: String,
    default: 'asc',
    required: true
  }
})
const SongList = mongoose.model('songlists', songListSchema)
module.exports = SongList
