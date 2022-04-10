const app = require('./app')
const mongoose = require('mongoose')

const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((con) => {
    console.log('DB connection successful!')
  })
  .catch((err) => {
    console.log(err)
  })

const PORT = process.env.PORT || 80
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
