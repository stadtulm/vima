const mongoose = require('mongoose')
const { Schema } = mongoose

module.exports = new Schema({
  lang: {
    type: String,
    enum: ['de', 'en', 'ru']
  },
  type: {
    type: String,
    enum: ['default', 'deepl', 'author']
  },
  value: {
    type: String
  },
  _id: false
})
