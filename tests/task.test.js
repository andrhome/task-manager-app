const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {
  userId,
  testUser,
  setupDatabase,
  testTask,
  testTask3
} = require('./fixtures/db');
const User = require('../src/models/user');

beforeEach(setupDatabase);

afterAll(async () => {
  await User.deleteMany();
  await Task.deleteMany();
});

test('Should create a task for the user', async () => {
  const resp = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      description: 'New test task'
    })
    .expect(201)

  const task = await Task.findById(resp.body._id);

  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should get all the tasks for the first test user', async () => {
  const resp = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      owner: userId
    })
    .expect(200);

  expect(resp.body.items.length).toEqual(2);
  expect(resp.body.items[0].owner.toString()).toEqual(userId.toString());
  expect(resp.body.items[1].owner.toString()).toEqual(userId.toString());
});

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`/tasks/${testTask3._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(404)

  const task = await Task.findById(testTask3._id);

  expect(task).toMatchObject(testTask3);
});

test('Should delete own user\'s task', async () => {
  await request(app)
    .delete(`/tasks/${testTask._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(testTask._id);

  expect(task).toBeNull();
});
