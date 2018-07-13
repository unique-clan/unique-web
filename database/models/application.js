const Schema = require('mongoose').Schema;

const ApplicationSchema = new Schema({
  twName: {
    type: String,
    required: [true, 'The teeworlds name is required'],
    unique: true
  },
  country: {
    type: String,
    required: [true, 'The country is required']
  },
  gender: {
    type: String,
    required: [true, 'The gender is required.']
  },
  gameModes: {
    type: [String],
    default: ''
  },
  presentation: {
    type: String,
    required: [true, 'The presentation is required.'],
    minlength: [100, 'A minimum length of 100 characters is required.']
  }
});

module.exports = exports = ApplicationSchema;
