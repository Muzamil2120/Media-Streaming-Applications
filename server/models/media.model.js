import mongoose from 'mongoose'

const MediaSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: 'Title is required'
  },
  description: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  video: {
    data: Buffer,
    contentType: String
  },
  photo: {
    data: Buffer,
    contentType: String
  }
})

export default mongoose.model('Media', MediaSchema)