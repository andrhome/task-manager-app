const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const testUser = {
  name: 'Bob',
  email: 'bob@test.com',
  password: '12345678!'
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(testUser).save();
});

test('Should signup a new user', async () => {
  await request(app).post('/users').send({
    name: 'John',
    email: 'john@test.com',
    password: 'john12345'
  }).expect(201);
});

test('Should login existing user', async () => {
  await request(app).post('/users/login').send({
    email: testUser.email,
    password: testUser.password
  })
});

test('Should not login nonexistent user', async () => {
  await request(app).post('/users/login').send({
    email: 'test@test.com',
    password: '11111111'
  }).expect(400);
});
