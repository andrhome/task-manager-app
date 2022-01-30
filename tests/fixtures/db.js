const jwt = require('jsonwebtoken');
const {
  generateObjectId,
  getJwtSecretKey
} = require('../../src/utils/common-utils');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userId = generateObjectId();
const testUser = {
  _id: userId,
  name: 'Bob',
  email: 'bob@test.com',
  password: '12345678!',
  tokens: [{
    token: jwt.sign({ _id: userId }, getJwtSecretKey())
  }]
};

const user2Id = generateObjectId();
const testUser2 = {
  _id: user2Id,
  name: 'Jess',
  email: 'jess@test.com',
  password: 'jess003@@',
  tokens: [{
    token: jwt.sign({ _id: user2Id }, getJwtSecretKey())
  }]
};

const testTask = {
  _id: generateObjectId(),
  description: 'This is the first test task.',
  completed: false,
  owner: userId
};

const testTask2 = {
  _id: generateObjectId(),
  description: 'The second test task.',
  completed: true,
  owner: userId
};

const testTask3 = {
  _id: generateObjectId(),
  description: 'The third test task.',
  completed: true,
  owner: user2Id
};

/**
 * Method for setting up the test database with mock user data
 * before running tests
 * @returns {Promise<void>}
 */
const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(testUser).save();
  await new User(testUser2).save();
  await new Task(testTask).save();
  await new Task(testTask2).save();
  await new Task(testTask3).save();
};

module.exports = {
  userId,
  testUser,
  testTask,
  testTask3,
  setupDatabase
}
