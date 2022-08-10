const express = require('express')
var cors = require('cors')
const dotenv = require('dotenv')
const userRoute = require('./routes/userRoute')
const songCategoryRoute = require('./routes/songCategoryRoute')
const songRoute = require('./routes/songRoute')
const app = express()

dotenv.config({ path: '.env' })
//MiddleWare
app.use(cors())
app.use(express.json())
app.use(express.static(`${__dirname}/public`))

//Router
app.use('/api/v1/users', userRoute)
app.use('/api/v1/songCategory', songCategoryRoute)
app.use('/api/v1/songs', songRoute)

module.exports = app
