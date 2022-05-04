const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
   const blogs = await Blog
      .find({})
      .populate('user', { username: 1, name: 1 })
   response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
   const blog = await Blog
      .findById(request.params.id)
      .populate('user', { username: 1, name: 1 })
   if (blog) {
      response.json(blog)
   } else {
      response.status(404).end()
   }
})

blogRouter.post('/', userExtractor, async (request, response) => {
   const { body, user } = request

   if (body.title === undefined || body.title === '' || body.url === undefined || body.url === '') {
      return response.status(400).json({ error: 'title or url missing' })
   }

   const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
   })

   let savedBlog = await blog.save()
   user.blogs = user.blogs.concat(savedBlog._id)
   await user.save()
   
   savedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
   response.status(201).json(savedBlog)
})

blogRouter.put('/:id', async (request, response) => {
   const body = request.body

   const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
   }

   const updatedBlog = await Blog
      .findByIdAndUpdate(request.params.id, blog, { new: true })
      .populate('user', { username: 1, name: 1 })

   response.json(updatedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {
   const { user } = request

   const blog = await Blog.findById(request.params.id)

   if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
   }

   if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
   } else {
      response.status(401).json({ error: 'no permission to delete' })
   }
})


module.exports = blogRouter
