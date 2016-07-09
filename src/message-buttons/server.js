const koa = require('koa');
const Router = require('koa-router');

module.exports = function() {
  const app = koa();
  const router = new Router();

  router.post('/slack/actions', function* (next) {
    this.body = 'Aww!';

    yield next;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
