const koa = require('koa');
const Router = require('koa-router');

const bodyParser = require('koa-body');

module.exports = function() {
  const app = koa();
  app.use(bodyParser());

  const router = new Router();

  router.post('/slack/actions', function* (next) {
    const payload = JSON.parse(this.request.body.payload);
    const action = payload.actions[0];

    if (action.value === 'yes') {
      this.body = 'Let us continue.';
    } else if (action.value === 'more') {
      this.body = 'Here is more information.';
    } else {
      this.body = 'Aww!';
    }

    yield next;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
