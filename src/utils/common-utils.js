const bcrypt = require('bcryptjs');

/**
 * Error handler method
 * @param res
 * @param err
 */
const requestErrorHandler = (res, err) => {
  res.status(400).send(err);
};

/**
 * Upload file error handler method
 * @param err
 * @param req
 * @param res
 * @param next
 */
const filesUploadErrorHandler = (err, req, res, next) => {
  res.status(400).send({ error: err.message });
};

/**
 * Method for getting encryption password
 * @param password
 * @param salt
 * @returns {Promise<*|*>}
 */
const getHashPassword = async (password, salt) => {
  let hashPassword = password;
  try {
    hashPassword = await bcrypt.hash(password, salt);
  } catch (err) {
    console.log(`Encryption ERROR: ${err}`);
    return err;
  }

  return hashPassword;
};

/**
 * Method for comparing a password with a password hash
 * @param password - A password from the request
 * @param hash - A user password hash from the DB
 * @returns {Promise<*|*>}
 */
const matchPassword = async (password, hash) => {
  let isMatch = false;
  try {
    isMatch = await bcrypt.compare(password, hash);
  } catch (err) {
    console.log(`Password comparing ERROR: ${err}`);
    return err;
  }

  return isMatch;
};

// TODO: To implement count of all the items in the DB and put it in the "total"
/**
 * Method returns prepared response object with "items"
 * and "total" properties
 * @param items - Response from the DB
 * @returns { {} | { items: array, total: number}}
 */
const getStructuredResponse = (items) => {
  if (!items) return {};

  return {
    items,
    total: items.length || 0
  };
};

module.exports = {
  requestErrorHandler,
  filesUploadErrorHandler,
  getHashPassword,
  matchPassword,
  getStructuredResponse
};
