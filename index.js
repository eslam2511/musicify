const express = require('express')
const app = express()
const Auth = require('./routes/Auth')
const port = 3000
const mongoose = require('mongoose')
const db_uri = process.env.MONGO_URI

mongoose.connect(db_uri)

app.use('/api/auth', Auth)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('test')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
