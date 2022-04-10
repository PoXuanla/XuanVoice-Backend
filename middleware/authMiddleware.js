const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = getToken(req)
  if (!token) {
    // header 缺少 token
    return res.status(200).json({
      status: 'failed',
      message: 'Lack Token'
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
    req.body.user = decoded.user
  } catch (err) {
    res.status(200).json({
      //token 解析失敗
      status: 'failed',
      message: 'Invalid token'
    })
  }
  return next()
}
const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  }
  return null
}
module.exports = verifyToken
