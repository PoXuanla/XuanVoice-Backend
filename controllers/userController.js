const User = require('../models/userModels')
const Song = require('../models/songModels')
const { getStorage } = require('firebase-admin/storage')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

exports.getAllUser = async (req, res) => {
  const data = await User.find()
  res.status(200).json({
    user: data
  })
}

exports.createUser = async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(409).json({
        status: 'failed',
        message: '密碼未輸入或小於六個位元。'
      })
    }
    req.body.password = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create(req.body)
    const token = jwt.sign(
      {
        user: newUser
      },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: '7d'
      }
    )
    //圖片上傳firebase，檔名為使用者帳號
    if (req.file) {
      const bucket = getStorage().bucket() //連接firebase bucket
      req.file.originalname = `${newUser.account}.jpg`
      const blob = bucket.file('userImg/' + req.file.originalname)
      const blobStream = blob.createWriteStream()
      blobStream.on('error', (err) => {
        console.log(`err ${err}`)
        throw err
      })
      blobStream.on('finish', async () => {
        // The public URL can be used to directly access the file via HTTP.
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/userImg/${newUser.account}.jpg`
        //更新 user 資料
        let updateUser = await User.findByIdAndUpdate(
          { _id: newUser.id },
          { image: imageUrl },
          { new: true }
        )
        const updateToken = jwt.sign(
          {
            user: updateUser
          },
          process.env.JWT_PRIVATE_KEY,
          {
            expiresIn: '7d'
          }
        )
        res.status(201).json({
          status: 'success',
          user: updateUser,
          token: updateToken
        })
      })
      blobStream.end(req.file.buffer)
    } else {
      //沒有上傳圖片
      res.json({
        status: 'success',
        user: newUser,
        token: token
      })
    }
  } catch (err) {
    if (err.code && err.code === 11000) {
      return res.status(200).json({
        status: 'failed',
        message: '帳號已被使用'
      })
    }
    res.status(200).json({
      status: 'failed',
      message: err
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body
    if (!account || !password)
      return res.json({
        status: 'failed',
        message: '缺少參數'
      })
    // find user and return all fields except password
    const user = await User.findOne({ account })
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          user: user
        },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: '7d'
        }
      )
      user.password = undefined
      return res.json({
        status: 'success',
        user,
        token
      })
    }
    res.json({
      status: 'failed',
      message: '登入失敗'
    })
  } catch (err) {
    res.json({
      status: 'failed',
      message: err
    })
  }
}

exports.test = (req, res) => {
  res.json({
    status: 'success',
    user: req.body.user
  })
}

exports.getSongByUser = async (req, res) => {
  try {
    const userId = req.params.userId
    const songs = await Song.find({
      author: userId
    })
    console.log(songs)
    res.status(200).json({
      status: 'success',
      song: songs
    })
  } catch (e) {
    res.status(400).json({
      status: 'failed'
    })
  }
}

exports.getUserInform = async (req, res) => {
  try {
    const account = req.params.account
    const inform = await User.findOne({ account: account }).populate({
      path: 'songs',
      select: ['name','image']
    })

    if (inform === null) {
      res.status(200).json({
        status: 'failed'
      })
    }
    res.status(200).json({
      status: 'success',
      inform: inform
    })
  } catch (e) {
    res.status(200).json({
      status: 'failed'
    })
  }
}
