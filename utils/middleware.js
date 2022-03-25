const User = require('../models/user')
const jwt = require('jsonwebtoken')

const unknownEndpoint = (request, response) => {
   response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
   console.error(error.message)

   if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
   } else if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
   } else if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
         error: 'invalid token'
      })
   }

   next(error)
}

const tokenExtractor = (request, response, next) => {
   const authorization = request.get('authorization')
   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      request.token = authorization.substring(7)
   }

   next()
}

const userExtractor = async (request, response, next) => {
   const token = request.token
   const decodedToken = jwt.verify(token, process.env.SECRET)
   const user = await User.findById(decodedToken.id)
   
   if (!user) {
      return response.status(401).json({
         error: 'token missing or invalid'
      })
   }

   request.user = user

   next()
}

module.exports = {
   unknownEndpoint,
   errorHandler,
   tokenExtractor,
   userExtractor
}