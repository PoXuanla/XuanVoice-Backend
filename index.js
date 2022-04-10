const app = require('./app')
const mongoose = require('mongoose')

const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful!')
  })
  .catch((err) => {
    console.log(err)
  })

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
