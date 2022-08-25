const Song = require('../models/songModels')
const { getStorage } = require('firebase-admin/storage')
const User = require('../models/userModels')

exports.createSong = async (req, res) => {
  try {
    const userId = req.user._id

    //找到 User 更新 populate song
    req.body.author = userId
    const song = await Song.create(req.body)
    const user = await User.findByIdAndUpdate({ _id: userId }, { $push: { songs: song._id } })
    const mp3 = req.files['mp3'][0]
    mp3.originalname = `${song._id}.mp3`
    const bucket = getStorage().bucket() //連接firebase bucket
    const blob = bucket.file('song/' + mp3.originalname)
    const blobStream = blob.createWriteStream()
    blobStream.end(mp3.buffer)
    blobStream.on('error', (err) => {
      console.log(`err ${err}`)
      throw err
    })
    blobStream.on('finish', async () => {
      const mp3Url = `https://storage.googleapis.com/${bucket.name}/song/${mp3.originalname}`
      console.log(mp3Url)
      let updateMp3Song = await Song.findByIdAndUpdate(
        { _id: song.id },
        { mp3: mp3Url },
        { new: true }
      )
      if (req.files['img']) {
        const img = req.files['img'][0]
        img.originalname = `${song._id}.jpg`
        const blob = bucket.file('songImg/' + img.originalname)
        const blobStream = blob.createWriteStream()
        blobStream.on('finish', async () => {
          const imgUrl = `https://storage.googleapis.com/${bucket.name}/songImg/${img.originalname}`
          console.log(imgUrl)
          let updateImgSong = await Song.findByIdAndUpdate(
            { _id: updateMp3Song.id },
            { image: imgUrl },
            { new: true }
          )
          res.status(200).json({
            status: 'success',
            song: updateImgSong
          })
        })
        blobStream.end(img.buffer)
      } else {
        res.status(200).json({
          status: 'success',
          song: updateMp3Song
        })
      }
    })
  } catch (error) {
    console.log(`create song ${error}`)
    res.status(200).json({
      status: 'failed',
      message: error
    })
  }
}
exports.getSongBySongId = async (req, res) => {
  try {
    const songId = req.params.songId
    const song = await Song.findById({ _id: songId })
      .populate({ path: 'songCategory', select: 'name' })
      .populate({ path: 'author', select: 'name' })
    res.status(200).json({
      status: 'success',
      song: song
    })
  } catch (error) {
    console.log(error)
    res.status(200).json({
      status: 'failed',
      message: error
    })
  }
}
exports.deleteSongBySongId = async (req, res) => {
  try {
    const userId = req.user._id
    const songId = req.params.songId
    const song = await Song.findById({ _id: songId })
    if (!song) throw '無此音樂'
    if (userId !== song.author.toString()) throw '無權執行此操作'
    await Song.deleteOne({ _id: songId })
    await User.findOneAndUpdate(
      { _id: song.author },
      {
        $pullAll: { songs: [song._id] }
      }
    )
    const bucket = getStorage().bucket()
    await bucket.file(`song/${songId}.mp3`).delete()
    if (song.image) await bucket.file(`songImg/${songId}.jpg`).delete()

    res.status(200).json({
      status: 'success',
      message: '刪除成功'
    })
  } catch (error) {
    res.status(200).json({
      status: 'failed',
      message: error
    })
  }
}
exports.updateSongBySongId = async (req, res) => {
  try {
    const songId = req.params.songId
    const userId = req.user._id
    const songData = await Song.findById({ _id: songId })
    if (userId !== songData.author.toString()) throw '無權執行此操作'
    const updateSong = await Song.findByIdAndUpdate({ _id: songId }, req.body, { new: true })
    if (req.files['img']) {
      const img = req.files['img'][0]
      img.originalname = `${updateSong._id}.jpg`
      const bucket = getStorage().bucket()
      const blob = bucket.file('songImg/' + img.originalname)
      const blobStream = blob.createWriteStream()
      blobStream.on('error', (err) => {
        console.log(err)
      })
      blobStream.on('finish', async () => {
        const imgUrl = `https://storage.googleapis.com/${bucket.name}/songImg/${img.originalname}`
        console.log(imgUrl)
        let updateImgSong = await Song.findByIdAndUpdate(
          { _id: updateSong.id },
          { image: imgUrl },
          { new: true }
        )
        res.status(200).json({
          status: 'successs'
        })
      })
      blobStream.end(img.buffer)
    } else {
      res.status(200).json({
        status: 'success'
      })
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}
