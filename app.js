const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const morgan = require('morgan')

mongoose
   .connect(config.MONGODB_URI)
   .then(() => {
      console.log('connected to MongoDB')
   })
   .catch((error) => {
      console.log('error connectin to MongoDB:', error.message)
   })

app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
   return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app