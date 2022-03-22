const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
   const blogs = await Blog.find({})
   response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
   const blog = await Blog.findById(request.params.id)
   if (blog) {
      response.json(blog)
   } else {
      response.status(404).end()
   }
})

blogRouter.post('/', async (request, response) => {
   const body = request.body

   if (body.title === undefined || body.title === '' || body.url === undefined || body.url === '') {
      return response.status(400).json({ error: 'title or url missing' })
   }

   const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0
   })

   const savedBlog = await blog.save()
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

   const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
   
   response.json(updatedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
   await Blog.findByIdAndRemove(request.params.id)
   response.status(204).end()
})


module.exports = blogRouter