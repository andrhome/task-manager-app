const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const secretKey = User.getSecretKey();
    const decode = jwt.verify(token, secretKey);
    const user = await User.findOne({ _id: decode._id, 'tokens.token': token });

    if (!user) {
      throw new Error('User with these credentials hasn\'t been found!');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate!' });
  }
};

module.exports = auth;
