const mongoose = require('mongoose')
const { Schema } = mongoose

module.exports = new Schema({
  lang: {
    type: String
  },
  type: {
    type: String,
    enum: ['default', 'ai', 'author']
  },
  value: {
    type: String
  },
  _id: false
},
{
  collation: { locale: 'en', strength: 1 }
}
)
