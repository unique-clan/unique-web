const Schema = require('mongoose').Schema

var ApplicationSchema = new Schema({
  twName: {
    type: String,
    required: [true, 'Missing name'],
    maxlength: [15, 'Max length is 15'],
    minlength: [1, 'Min length is 1'],
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Missing country']
  },
  gameModes: [String],
  gender: {
    type: String,
    required: [true, 'Missing gender']
  },
  presentation: {
    type: String,
    minlength: [100, 'Must be atleast 100 characters long.']
  },
  date: {
    type: Date,
    default: new Date()
  }
})

module.exports = exports = ApplicationSchema