const koa = require('koa');
const Router = require('koa-router');

const bodyParser = require('koa-body');

module.exports = function({attributeConfigurations, questionForAttributeConfiguration} = {}) {
  const app = koa();
  app.use(bodyParser());

  const router = new Router();

  router.post('/slack/actions', function* (next) {
    const payload = JSON.parse(this.request.body.payload);
    const attributeName = payload.callback_id;
    const action = payload.actions[0];

    if (attributeName === 'initial') {
      if (action.value === 'yes') {
        this.body = questionForAttributeConfiguration(attributeConfigurations[0]);
      } else if (action.value === 'more') {
        this.body = 'Here is more information.';
      } else {
        this.body = 'Aww!';
      }
    } else {
      const nextAttributeConfiguration = getNextAttributeConfiguration(attributeConfigurations, attributeName);

      if (nextAttributeConfiguration) {
        this.body = questionForAttributeConfiguration(nextAttributeConfiguration);
      } else {
        this.body = 'Thanks for participating! See you around the Slack.';
      }
    }

    yield next;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};

function getNextAttributeConfiguration(attributeConfigurations, attributeName) {
  const attributeConfigurationIndex = attributeConfigurations.findIndex(attributeConfiguration => attributeConfiguration.name === attributeName);
  return attributeConfigurations[attributeConfigurationIndex + 1];
}
