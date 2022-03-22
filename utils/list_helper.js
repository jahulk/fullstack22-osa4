const _ = require('lodash')

const dummy = (blogs) => {
   return 1
}

const totalLikes = (blogs) => {
   return blogs.reduce((acc, curr) => acc + curr.likes, 0)
}

const favoriteBlog = (blogs) => {
   if (!blogs.length) {
      return null
   }

   return _.maxBy(blogs, b => b.likes)
}

const mostBlogs = (blogs) => {
   if (!blogs.length) {
      return null
   }

   let blogsPerAuthor = []
   _.forEach(_.countBy(blogs, b => b.author), (value, key) => {
      blogsPerAuthor.push({
         author: key,
         blogs: value
      })
   })
   
   return _.maxBy(blogsPerAuthor, e => e.blogs)
}

const mostLikes = (blogs) => {
   if (!blogs.length) {
      return null
   }

   let likesPerAuthor = []
   _.forEach(_.groupBy(blogs, b => b.author), (value, key) => {
      likesPerAuthor.push({
         author: key,
         likes: _.sumBy(value, b => b.likes)
      })
   })

   return _.maxBy(likesPerAuthor, e => e.likes)
}

module.exports = {
   dummy,
   totalLikes,
   favoriteBlog,
   mostBlogs,
   mostLikes
}