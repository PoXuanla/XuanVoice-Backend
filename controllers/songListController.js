const SongList = require('../models/songListModels')
const User = require('../models/userModels')
const mongoose = require('mongoose')

/*route('/') */
exports.createList = async (req, res) => {
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
/*route('/userSongList') */
exports.getListByUserId = async (req, res) => {
  try {
    const userId = req.user._id
    const userData = await User.findById({ _id: userId }).populate({ path: 'songList' })
    res.status(200).json({
      status: 'success',
      songList: userData.songList
    })
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: '不明原因錯誤'
    })
  }
}

/*route('/userSongList/exist/:songId') */

//回傳User all List 並判斷歌曲是存在 List 中
exports.getListsAndCheckSongExistList = async (req, res) => {
  try {
    const songId = req.params.songId
    const userId = mongoose.Types.ObjectId(req.user._id)
    const songLists = await SongList.aggregate([
      { $match: { user: userId } },
      {
        $project: {
          _id: 1,
          name: 1,
          hasThisSong: { $in: [mongoose.Types.ObjectId(songId), '$songs.songId'] }
        }
      }
    ])
    res.status(200).json({
      songLists: songLists
    })
  } catch (e) {
    res.status(200).json({
      error: e
    })
  }
}

/* route('/:songListId') */

exports.patchListData = async (req, res) => {
  try {
    const songListId = req.params.songListId
    const action = req.body.action //Delete old Song or Add new Song to SongList

    if (action === 'add') {
      await SongList.findByIdAndUpdate(
        { _id: songListId },
        { $push: { songs: { songId: req.body.songId } } },
        { new: true }
      )
        .then(async (songList) => {
          if (songList.songs.length === 1) return Promise.resolve(songList)

          let maxOrderInDB = Math.max(...songList.songs.map((data) => data.order))
          let seachSongId = songList.songs[songList.songs.length - 1].songId

          await SongList.findOneAndUpdate(
            { _id: songListId, 'songs.songId': seachSongId },
            { $set: { 'songs.$.order': maxOrderInDB + 1 } },
            { new: true }
          )
          return Promise.resolve(songList)
        })
        .then((songList) => {
          res.status(200).json({
            status: 'success',
            message: `已將歌曲新增至"${songList.name}`
          })
        })
        .catch((e) => {
          console.log(e)
          res.status(200).json({
            status: 'failed',
            message: e
          })
        })
    } else if (action === 'delete') {
      await SongList.findOneAndUpdate(
        { _id: songListId },
        {
          $pull: { songs: { songId: req.body.songId } }
        }
      )
        .then((songList) => {
          res.status(200).json({
            status: 'success',
            message: `已從歌單"${songList}"刪除曲目`
          })
        })
        .catch((e) => {
          res.status(200).json({
            status: 'failed',
            message: '不明原因更新失敗'
          })
        })
    } else {
      throw 'no this action'
    }
  } catch (e) {
    res.status(200).json({
      status: 'failed',
      message: '不明原因更新失敗'
    })
  }
}
exports.deleteList = async (req, res) => {
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

exports.getListSongs = async (req, res) => {
  try {
    const songListId = mongoose.Types.ObjectId(req.params.songListId)

    const response = await SongList.findById({ _id: songListId }, 'orderBy sort name songs')
    const { orderBy, sort, name, songs } = response.toObject()
    let sortMode = null
    if (orderBy === 'createdAt') sortMode = { 'songs.createdAt': sort === 'asc' ? 1 : -1 }
    if (orderBy === 'songCreatedTime')
      sortMode = { 'songs.songCreatedTime': sort === 'asc' ? 1 : -1 }
    if (orderBy === 'manual') sortMode = { 'songs.order': sort === 'asc' ? 1 : -1 }
    if (songs.length === 0) {
      res.status(200).json({
        status: 'success',
        listName: name,
        mode: { orderBy, sort },
        songs: songs
      })
    }
    let songList = await SongList.aggregate([
      { $match: { _id: songListId } },
      { $unwind: '$songs' },
      { $addFields: {'songs.listName':'$name'} },
      {
        $lookup: {
          from: 'songs',
          localField: 'songs.songId',
          foreignField: '_id',
          as: 'songInfo'
        }
      },
      { $addFields: { songInfo: '$songInfo' } },
      { $unwind: '$songInfo' },
      {
        $addFields: {
          'songs.author': '$songInfo.author',
          'songs.name': '$songInfo.name',
          'songs.image': '$songInfo.image',
          'songs.songCreatedTime': '$songInfo.createdAt',
          'songs.mp3': '$songInfo.mp3'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'songs.author',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $addFields: {
          'songs.author.name': '$userInfo.name',
          'songs.author._id': '$userInfo._id',
          'songs.author.account': '$userInfo.account'
        }
      },
      { $sort: sortMode },
      {
        $group: {
          _id: '$_id',
          songs: { $push: '$songs' }
        }
      }
    ])

    let songListResponse = songList.map((data) => data.songs)
    res.status(200).json({
      status: 'success',
      listName: name,
      mode: { orderBy, sort },
      songs: songListResponse[0]
    })
  } catch (e) {
    res.status(400).json({
      message: e
    })
  }
}
exports.replaceSongOrder = async (req, res) => {
  try {
    const songListId = req.params.songListId
    const songs = req.body.songs
    await SongList.findByIdAndUpdate({ _id: songListId }, { $set: { songs: songs } }, { new: true })

    res.status(200).json({
      status: 'success',
      message: '順序調整成功'
    })
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: e
    })
  }
}
exports.replaceSortMode = async (req, res) => {
  try {
    const songListId = req.params.songListId
    const orderBy = req.body.orderBy
    const sort = req.body.sort

    const result = await SongList.findByIdAndUpdate(
      { _id: songListId },
      { $set: { orderBy: orderBy, sort: sort } },
      { new: true }
    )

    res.status(200).json({
      status: 'success',
      message: '已更新歌曲排序',
      mode: { orderBy: result.orderBy, sort: result.sort }
    })
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: e
    })
  }
}
