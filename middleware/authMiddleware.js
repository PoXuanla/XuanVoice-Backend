const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = getToken(req)
  if (!token) {
    // header 缺少 token
    return res.status(401).json({
      status: 'tokenError',
      message: '憑證失效或錯誤，請重新登入!'
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
    req.user = decoded.user
  } catch (err) {
    res.status(401).json({
      //token 解析失敗
      status: 'tokenError',
      message: '憑證失效或錯誤，請重新登入!'
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
