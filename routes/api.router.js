const apiRouter = require('express').Router();
const categoriesRouter = require('./categories.router');
const reviewsRouter = require('./review.router');
const commentsRouter = require('./comments.router');
const usersRouter = require('./users.router');

apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
