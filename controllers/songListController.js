const SongList = require('../models/songListModels')
const User = require('../models/userModels')

exports.createSongList = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      user: req.user._id
    }
    const songList = await SongList.create(data)
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { songList: songList._id }
      }
    )

    res.status(200).json({
      status: 'success',
      message: '建立成功'
      // songList: user.songList.songList
    })
  } catch (e) {
    res.status(200).json({
      status: 'failed',
      message: '建立失敗'
    })
  }
}
exports.deleteSongListById = async (req, res) => {
  try {
    const songListId = req.params.songListId
    await SongList.deleteOne({ _id: songListId })
    res.status(200).json({
      status: 'success',
      message: '已刪除歌單'
    })
  } catch (e) {
    res.status(200).json({
      status: 'failed',
      message: '歌單刪除失敗'
    })
  }
}
exports.deleteSongInList = async (req, res) => {
  await SongList.findOneAndUpdate(
    { _id: req.body.songListId },
    {
      $pullAll: { songs: req.body.song }
    }
  )
}
exports.findSongListsByUserId = async (req, res) => {
  try {
    const userId = req.user._id
    const userData = await User.findById({ _id: userId }).populate({ path: 'songList' })
    res.status(200).json({
      status: 'success',
      songList: userData.songList
    })
  } catch (e) {
    res.status(200).json({
      status: 'failed',
      message: '不明原因錯誤'
    })
  }
}
exports.updateSongInList = async (req, res) => {
  try {
    const songListId = req.params.songListId
    console.log(req.body)
    const action = req.body.action //Delete old Song or Add new Song to SongList
    if (action === 'add') {
      let songList = await SongList.findByIdAndUpdate(
        { _id: songListId },
        { $push: { songs: req.body.song } }
      )
      res.status(200).json({
        status: 'success',
        message: `已將歌曲新增至"${songList.name}"`
      })
    } else if (action === 'delete') {
      let songList = await SongList.findOneAndUpdate(
        { _id: songListId },
        { $pullAll: { songs: [req.body.song] } }
      )
      res.status(200).json({
        status: 'success',
        message: `已從歌單"${songList}"刪除部分曲目`
      })
    }
    res.status(200).json({
      status: 'failed',
      message: '不明原因更新失敗'
    })
  } catch (e) {
    res.status(200).json({
      status: 'failed',
      message: '不明原因更新失敗'
    })
  }
}
