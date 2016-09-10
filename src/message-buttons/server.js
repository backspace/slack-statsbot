const koa = require('koa');
const Router = require('koa-router');

const bodyParser = require('koa-body');

const request = require('superagent');

const userInformation = require('../reports/user-information');
const DirectMessageHandler = require('../direct-message-handler');

module.exports = function({attributeConfigurations, questionForAttributeConfiguration, userRepository} = {}) {
  const app = koa();
  app.use(bodyParser());

  const router = new Router();

  router.post('/slack/actions', function* (next) {
    const payload = JSON.parse(this.request.body.payload);

    if (payload.token !== process.env.SLACK_VERIFICATION_TOKEN) {
      this.status = 403;
      yield next;
      return;
    }

    const attributeName = payload.callback_id;
    const action = payload.actions[0];

    if (attributeName === 'initial') {
      if (action.value === 'yes') {
        request.post(payload.response_url).send({
          text: DirectMessageHandler.INTERVIEW_INTRODUCTION,
          attachments: [{
            title: 'Would you like to self-identify?',
            text: 'Yes'
          }],
          replace_original: true
        })
        .end((err, res) => {
          request.post(payload.response_url).send({
            attachments: [questionForAttributeConfiguration(attributeConfigurations[0])],
            replace_original: false
          }).end();
        });
      } else if (action.value === 'more') {
        this.body = 'Here is more information.';
      } else {
        this.body = 'Aww!';
      }
    } else {
      const attributeValueToFind = action.value === 'decline' ? null : action.value;

      const responseAttributeConfiguration = attributeConfigurations.find(configuration => configuration.name === attributeName);
      const responseAttributeValue = responseAttributeConfiguration.values.find(attributeValue => attributeValue.value === attributeValueToFind);

      const userID = payload.user.id;

      userRepository.storeAttribute(userID, attributeName, attributeValueToFind);

      const nextAttributeConfiguration = getNextAttributeConfiguration(attributeConfigurations, attributeName);

      if (nextAttributeConfiguration) {
        request.post(payload.response_url).send({
          attachments: [{
            title: responseAttributeConfiguration.interviewQuestion,
            text: responseAttributeValue.texts.interviewAnswer
          }],
          replace_original: true
        })
        .end((err, res) => {
          request.post(payload.response_url).send({
            attachments: [questionForAttributeConfiguration(nextAttributeConfiguration)],
            replace_original: false
          }).end();
        });
      } else {
        yield userInformation(userID, {
          userRepository: userRepository,
          attributeConfigurations: attributeConfigurations
        }).then(reply => {
          request.post(payload.response_url).send({
            attachments: [{
              title: responseAttributeConfiguration.interviewQuestion,
              text: responseAttributeValue.texts.interviewAnswer
            }],
            replace_original: true
          })
          .end((err, res) => {
            request.post(payload.response_url).send({
              text: 'Thanks for participating. See you around the Slack!',
              replace_original: false
            }).end();
          });
        });
      }
    }

    yield next;
  });

  router.get('/oauth', function* (next) {
    if (this.request.query.code) {
      const requestPromise = new Promise((resolve) => {
        request
          .post('https://slack.com/api/oauth.access')
          .type('form')
          .send({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: this.request.query.code
          })
          .end((err, res) => {
            if (res.body.ok) {
              this.body = {bot_access_token: res.body.bot.bot_access_token};
            } else {
              this.body = {error: res.body.error};
            }

            resolve();
          });
      });

      yield requestPromise;
    } else {
      this.status = 422;
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};

function getNextAttributeConfiguration(attributeConfigurations, attributeName) {
  const attributeConfigurationIndex = attributeConfigurations.findIndex(attributeConfiguration => attributeConfiguration.name === attributeName);
  return attributeConfigurations[attributeConfigurationIndex + 1];
}
