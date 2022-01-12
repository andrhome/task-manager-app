jest.setTimeout(30000);

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
  const passwordMock = 'john12345';
  const response = await request(app)
    .post('/users')
    .send({
      name: 'John',
      email: 'john@test.com',
      password: passwordMock
    });

  expect(response.statusCode).toEqual(201);

  const user = await User.findById(response.body.user._id);

  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: 'John',
      email: 'john@test.com',
    },
    token: user.tokens[0].token
  });
  expect(user.password).not.toEqual(passwordMock);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: testUser.password
    });

  expect(response.statusCode).toEqual(200);

  const user = await User.findById(testUser._id);

  // Check the second token matching
  expect(response.body.token).toEqual(user.tokens[1].token);
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
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete the user account', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userId);

  expect(user).toBeNull()
});

test('Should not delete an account of unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload an avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/test-img.jpg')
    .expect(200)

  const user = await User.findById(userId);

  expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Should update valid user fields', async () => {
  const nameMock = 'Mike';
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({ name: nameMock })
    .expect(200);

  const user = await User.findById(userId);

  expect(user.name).toEqual(nameMock);
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({ location: null })
    .expect(400);
});
