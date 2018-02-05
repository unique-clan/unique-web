const Schema = require('mongoose').Schema
var bcrypt = require('bcrypt')

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours

var UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Missing username.'],
    maxlength: [30, 'Username can\'t be longer than 30 characters.'],
    minlength: [3, 'Username can\'t be shorter than 3 characters.'],
    index: {
      unique: true
    }
  },
  tw_name: {
    type: String,
    required: [true, 'Teeworlds name is required.'],
    minlength: [1, 'Teeworlds name can\'t be shorter than 1 character.'],
    maxlength: [15, 'Teeworlds name can\'t be longer than 15 characters.']
  },
  password: {
    type: String,
    required: [true, 'Missing password.'],
    min: [6, 'Password must be atleast 6 characters long.']
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Number
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
    type: [String],
    default: ['DDRace']
  },
  favGameMode: {
    type: String
  },
  country: {
    type: String
  },
  registerDate: {
    type: Date,
    default: new Date()
  }
})

UserSchema.virtual('isLocked').get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', function (next) {
  var user = this

  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR || 10), function (err, salt) {
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

UserSchema.methods.incLoginAttempts = function (cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb)
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } }
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME }
  }
  return this.update(updates, cb)
}

var reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
}

UserSchema.statics.getAuthenticated = function (username, password, cb) {
  this.findOne({ username: username }, function (err, user) {
    if (err) return cb(err)

    // make sure the user exists
    if (!user) {
      return cb(null, null, reasons.NOT_FOUND)
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function (err) {
        if (err) return cb(err)
        return cb(null, null, reasons.MAX_ATTEMPTS)
      })
    }

    // test for a matching password
    user.comparePassword(password, function (err, isMatch) {
      if (err) return cb(err)

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user)
        // reset attempts and lock info
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        }
        return user.update(updates, function (err) {
          if (err) return cb(err)
          return cb(null, user)
        })
      }

      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function (err) {
        if (err) return cb(err)
        return cb(null, null, reasons.PASSWORD_INCORRECT)
      })
    })
  })
}

// Useful: https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1

module.exports = exports = UserSchema
