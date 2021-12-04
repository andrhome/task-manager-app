/**
 * Users endpoints
 */
const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const { requestErrorHandler } = require('../utils/common-utils');
const multer = require('multer');

// User sign up
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    const userInDb = await User.findOne({ email: user.email });
    if (userInDb) {
      res.status(400).send({ error: 'User with provided email is already exist!' });
      return;
    }

    await user.save();
    const token = await user.generateAuthToken();

    res.status(201);
    res.send({ user, token });
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// User login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);

    if (user.error) {
      res.status(400);
    }

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// GET user me
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// Upload avatar
const upload = multer({
  dest: 'images/avatars',
  limits: {
    fileSize: 2000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('File must be an image!'));
    }

    callback(undefined, true);
  }
});
router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
  res.send();
});

// User logout
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send({ status: 'User is logged out!' });
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// User logout of all the sessions
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send({ status: 'User is logged out from all the sessions!' });
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// PATCH user
router.patch('/users/me', auth, async (req, res) => {
  const patchProps = Object.keys(req.body);
  const userProps = ['name', 'password', 'email', 'age'];
  const isAvailableUpdate = patchProps.every(prop => userProps.includes(prop));

  if (!isAvailableUpdate) {
    return res.status(400).send({error: 'Invalid updates!'});
  }

  try {
    patchProps.forEach(prop => req.user[prop] = req.body[prop]);
    await req.user.save();

    res.send(req.user);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// DELETE user
router.delete('/users/me', auth, async (req, res) => {
  try {
    req.user.remove();
    res.send(req.user);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

module.exports = router;
