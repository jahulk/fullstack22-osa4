const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
   await Blog.deleteMany({})
   await Blog.insertMany(helper.initialBlogs)
})

test('all blogs are returned as JSON', async () => {
   const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

   expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blog identifier field is called id', async () => {
   const response = await api.get('/api/blogs')

   for (let blog of response.body) {
      expect(blog.id).toBeDefined()
   }
})

test('a valid blog can be added', async () => {
   const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
   }

   await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')

   const blogsAtEnd = await helper.blogsInDb()
   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})

test('if likes is undefined then likes is set to 0', async () => {
   const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
   }

   const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', 'application/json; charset=utf-8')

   expect(response.body.likes).toBe(0)
})

test('blog without title or url is not added', async () => {
   let newBlog = {
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 7
   }

   let response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

   let blogsAtEnd = await helper.blogsInDb()
   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

   newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 7
   }

   response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

   blogsAtEnd = await helper.blogsInDb()
   expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog can be deleted', async () => {
   const blogsAtStart = await helper.blogsInDb()
   const blogToDelete = blogsAtStart[0]

   await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

   const blogsAtEnd = await helper.blogsInDb()

   expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
})

test('blog can be updated', async () => {
   const blogsAtStart = await helper.blogsInDb()
   const blogToUpdate = blogsAtStart[0]
   
   const blog = {...blogToUpdate, likes: blogToUpdate.likes + 1}

   await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blog)
      .expect(200)

   const blogsAtEnd = await helper.blogsInDb()
   expect(blogsAtEnd[0].likes).toBe(blogToUpdate.likes + 1)
})

afterAll(() => {
   mongoose.connection.close()
})

