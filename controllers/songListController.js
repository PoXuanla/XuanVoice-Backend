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
exports.getListSongs = async (req, res) => {
  try {
    const songListId = req.params.songListId
    const songListData = await SongList.findById({ _id: songListId }).populate({
      path: 'songs.songId',
      select: 'name image author',
      populate: {
        path: 'author',
        select: 'account'
      }
    })
    const songs = songListData.songs

    const processSongs = songs.map((song) => song.songId)

    res.status(200).json({
      status: 'success',
      listName: songListData.name,
      songs: processSongs
    })
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: '不明原因失敗ff'
    })
  }
}
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

exports.testGetSongs = async (req, res) => {
  try {
    const songListId = mongoose.Types.ObjectId(req.params.songListId)
    const order = req.query.order
    const sort = req.query.sort
    //加入歌單時間
    if (order === 'createdTime') {
      await SongList.aggregate([
        { $match: { _id: songListId } },
        {
          $unwind: '$songs'
        },
        {
          $sort: { 'songs.createdAt': sort === 'asc' ? 1 : -1 }
        },
        { $group: { _id: '$_id', songs: { $push: '$songs' } } }
      ])
        .then((songList) => {
          res.status(200).json({
            data: songList[0]
          })
        })
        .catch((e) => {
          res.status(400).json({
            message: e
          })
        })
    }
    //創作者建立歌曲時間
    if (order === 'songCreatedTime') {
      await SongList.aggregate([
        { $match: { _id: songListId } },
        {
          $unwind: '$songs'
        },
        {
          $lookup: {
            from: 'songs',
            localField: 'songs.songId',
            foreignField: '_id',
            as: 'songInfo'
          }
        },
        {
          $sort: { 'songInfo.createdAt': sort === 'asc' ? 1 : -1 }
        },
        { $group: { _id: '$_id', songs: { $push: '$songs' } } }
      ])
        .then((songList) => {
          res.status(200).json({
            data: songList[0]
          })
        })
        .catch((e) => {
          res.status(400).json({
            message: e
          })
        })
    }
    //自訂
    if (order === 'custom') {
      await SongList.aggregate([
        { $match: { _id: songListId } },
        {
          $unwind: '$songs'
        },
        {
          $sort: { 'songs.order': sort === 'asc' ? 1 : -1 }
        },
        { $group: { _id: '$_id', songs: { $push: '$songs' } } }
      ])
        .then((songList) => {
          res.status(200).json({
            data: songList[0]
          })
        })
        .catch((e) => {
          res.status(400).json({
            message: e
          })
        })
    }
  } catch (e) {
    res.status(400).json({
      message: e
    })
  }
}
