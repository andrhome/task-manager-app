const express = require('express');
require('./db/mongoose');
const userRouter = require('./routes/user-router');
const taskRouter = require('./routes/task-router');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
