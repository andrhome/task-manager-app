const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');
const {
  generateObjectId,
  getJwtSecretKey
} = require('../src/utils/common-utils');

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

beforeEach(async () => {
  await new User(testUser).save();
});

afterEach(async () => {
  await User.deleteMany();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'John',
      email: 'john@test.com',
      password: 'john12345'
    })
    .expect(201);
});

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .expect(200)
});

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'test@test.com',
      password: '11111111'
    })
    .expect(400);
});

test('Should get profile for the user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
});

test('Should delete the user account', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
});

test('Should not delete an account of unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
});
