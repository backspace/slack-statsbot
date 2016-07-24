const startServer = require('../../src/message-buttons/server');
const agent = require('supertest-koa-agent');

const test = require('tape');
const sinon = require('sinon');

const fakeUserRepository = {
  storeAttribute() {}
};

const firstAttributeConfiguration = {
  name: 'jorts',
  interviewQuestion: 'Do you wear jorts?',
  values: [{
    value: 'wears jorts',
    texts: {
      interviewAnswer: 'Yes',
      update: 'We have noted that you wear jorts.'
    }
  }, {
    value: 'does not wear jorts',
    texts: {
      interviewAnswer: 'No'
    }
  }, {
    value: 'sometimes wears jorts',
    texts: {
      interviewAnswer: 'Sometimes'
    }
  }, {
    value: null,
    texts: {
      interviewAnswer: 'Decline'
    }
  }]
};

const secondAttributeConfiguration = {
  name: 'jants',
  interviewQuestion: 'Do you wear jants?',
  values: [{
    value: 'wears jants',
    texts: {
      interviewAnswer: 'Yes'
    }
  }, {
    value: 'does not wear jants',
    texts: {
      update: 'We have noted that you do not wear jants.'
    }
  }]
};

const attributeConfigurations = [
  firstAttributeConfiguration,
  secondAttributeConfiguration
];

function questionForAttributeConfiguration(attributeConfiguration) {
  return `${attributeConfiguration.name}Question`;
}

test('it handles acceptance of the initial interview question by responding with a question for the first attribute', function(t) {
  agent(startServer({attributeConfigurations, questionForAttributeConfiguration}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'initial',
      actions: [{
        name: 'yes',
        value: 'yes'
      }]
    })})
    .expect(200, {text: 'Excellent, thank you!', attachments: 'jortsQuestion'}, t.end);
});

test('it handles a response to the first attribute question by storing it and asking the second attribute question', function(t) {
  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jorts',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'yes',
        value: 'wears jorts'
      }]
    })})
    .expect(200, {text: 'We have noted that you wear jorts.', attachments: 'jantsQuestion'}, () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jorts', 'wears jorts'));
      storeAttributeStub.restore();
      t.end();
    });
});

test('it handles a decline response to the first attribute question by storing it as null', function(t) {
  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jorts',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'irrelevant',
        value: 'decline'
      }]
    })})
    .expect(200, () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jorts', null));
      storeAttributeStub.restore();
      t.end();
    });
});

test('it handles a response to the last attribute question by storing it and thanking and wrapping up', function(t) {
  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jants',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'irrelevant',
        value: 'does not wear jants'
      }]
    })})
    .expect(200, 'We have noted that you do not wear jants. Thanks for participating! See you around the Slack.', () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jants', 'does not wear jants'));
      storeAttributeStub.restore();
      t.end();
    });
});

test('it handles a more information request from the initial interview question', function(t) {
  agent(startServer())
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'initial',
      actions: [{
        name: 'more',
        value: 'more'
      }]
    })})
    .expect(200, 'Here is more information.', t.end);
});

test('it handles a rejection of the initial interview question', function(t) {
  agent(startServer())
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'initial',
      actions: [{
        name: 'no',
        value: 'no'
      }]
    })})
    .expect(200, 'Aww!', t.end);
});

test('it responds to an OAuth request with the bot access token', function(t) {
  const nock = require('nock');

  process.env.CLIENT_ID = 'client-id';
  process.env.CLIENT_SECRET = 'client-secret';

  nock('https://slack.com')
    .post('/api/oauth.access', 'client_id=client-id&client_secret=client-secret&code=a-code')
    .reply(200, {
      ok: true,
      bot: {
        bot_access_token: 'yesthisisthestring'
      }
    });

  agent(startServer())
    .get('/oauth')
    .type('form')
    .query({
      code: 'a-code'
    })
    .expect(200, (err, res) => {
      t.notOk(err, 'expected no error');
      t.equal(res.body.bot_access_token, 'yesthisisthestring');

      nock.cleanAll();
      t.end();
    });
});

test('it responds to an OAuth request lacking a code with an error', function(t) {
  agent(startServer())
    .get('/oauth')
    .type('form')
    .expect(422, (err, res) => {
      t.end();
    });
});

test('it handles an error from the Slack API', function(t) {
  const nock = require('nock');

  nock('https://slack.com')
    .post('/api/oauth.access')
    .reply(200, {
      ok: false,
      error: 'jorts_crisis'
    });

  agent(startServer())
    .get('/oauth')
    .type('form')
    .query({code: 'a-code'})
    .expect(422, (err, res) => {
      t.ok(err, 'expected an error');
      t.equal(res.body.error, 'jorts_crisis');

      nock.cleanAll();
      t.end();
    });
})
