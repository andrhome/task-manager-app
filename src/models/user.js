/**
 * User model
 */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const {
  getHashPassword,
  matchPassword
} = require('../utils/common-utils');

const SECRET_KEY = 'thisismysecretkey';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!');
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(pass) {
      if (pass.toLowerCase().includes('password')) {
        throw new Error('Password can\'t contain the word "password"!')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number!');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    SECRET_KEY
  );
  user.tokens = user.tokens.concat({ token })
  await user.save();

  return token;
};

userSchema.statics.getSecretKey = () => SECRET_KEY;

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    return { error: 'Unable to login!' };
  }

  const isMatch = await matchPassword(password, user.password);

  if (!isMatch) {
    return { error: 'Unable to login! Password hasn\'t been matched!' };
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await getHashPassword(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
