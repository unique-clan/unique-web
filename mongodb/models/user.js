const Schema = require('mongoose').Schema
var bcrypt = require('bcrypt')

var UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Missing username.'],
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: [true, 'Missing password.'],
    min: [6, 'Password must be atleast 6 characters long.']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isTester: {
    type: Boolean,
    default: false
  },
  gameModes: {
    type: String,
    enum: ['DDRace', 'Race', 'Block', 'OpenFNG', 'zCatch'],
    default: 'DDRace'
  }
})

UserSchema.pre('save', function (next) {
  var user = this

  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(process.env.SALT_WORK_FACTOR || 10, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

// Useful: https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1

module.exports = exports = UserSchema
