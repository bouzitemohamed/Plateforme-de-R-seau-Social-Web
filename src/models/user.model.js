const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: Buffer,
    default: null
  },
  avatarType: {
    type: String,
    default: null
  },
  banner: {
    type: Buffer,
    default: null
  },
  bannerType: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
