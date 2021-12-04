/**
 * Tasks endpoints
 */
const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');
const {
  requestErrorHandler,
  getStructuredResponse
} = require('../utils/common-utils');

// Create task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201);
    res.send(task);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// GET tasks
// GET tasks?completed=true
// GET tasks?limit=10&skip=10
// GET tasks?limit=10&skip=10
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    });
    res.send(getStructuredResponse(req.user.tasks));
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// Get task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: 'Task not found!' });
    }

    res.send(task);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// PATCH by id
router.patch('/tasks/:id', auth, async (req, res) => {
  const patchProps = Object.keys(req.body);
  const taskProps = ['description', 'completed'];
  const isAvailableUpdate = patchProps.every(prop => taskProps.includes(prop));

  if (!isAvailableUpdate) {
    return res.status(400).send({error: 'Invalid updates!'});
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: 'Task hasn\'t been found' });
    }

    patchProps.forEach(prop => task[prop] = req.body[prop]);
    await task.save();

    res.send(task);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

// DELETE by id
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: 'Task hasn\'t been found' });
    }

    res.send(task);
  } catch (err) {
    requestErrorHandler(res, err);
  }
});

module.exports = router;
