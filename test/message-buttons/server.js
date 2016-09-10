const startServer = require('../../src/message-buttons/server');
const agent = require('supertest-koa-agent');

const test = require('tape');
const sinon = require('sinon');

const DirectMessageHandler = require('../../src/direct-message-handler');

process.env.SLACK_VERIFICATION_TOKEN = 'a-verification-token';

const fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

const firstAttributeConfiguration = {
  name: 'jorts',
  interviewQuestion: 'Do you wear jorts?',
  values: [{
    value: 'wears jorts',
    texts: {
      interviewAnswer: 'Yes',
      update: 'We have noted that you wear jorts.',
      information: 'you wear jorts'
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
      update: 'We have noted that you do not wear jants.',
      information: 'you do not wear jants',
      interviewAnswer: 'No'
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

test('it handles acceptance of the initial interview question by repeating the question and answer and responding with a question for the first attribute', function(t) {
  const nock = require('nock');

  const responses = [];

  nock('https://example.com')
    .post('/a-response-url')
    .times(2)
    .reply((uri, requestBody) => {
      responses.push(JSON.parse(requestBody));

      if (responses.length === 2) {
        const firstResponse = responses[0];
        const secondResponse = responses[1];

        t.deepEqual(firstResponse, {
          text: DirectMessageHandler.INTERVIEW_INTRODUCTION,
          attachments: [{
            title: 'Would you like to self-identify?',
            text: 'Yes'
          }],
          replace_original: true
        }, 'should restate the question with the answer attached');

        t.deepEqual(secondResponse, {
          attachments: ['jortsQuestion'],
          replace_original: false
        }, 'should follow up with the first attribute question');

        t.end();
      }

      return [200, 'hello'];
    });

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'initial',
      actions: [{
        name: 'yes',
        value: 'yes'
      }],
      token: 'a-verification-token',
      response_url: 'https://example.com/a-response-url'
    })})
    .expect(200, () => {});
});

test('it handles a response to the first attribute question by storing it and asking the second attribute question', function(t) {
  const nock = require('nock');

  const responses = [];

  nock('https://example.com')
    .post('/a-response-url')
    .times(2)
    .reply((uri, requestBody) => {
      responses.push(JSON.parse(requestBody));

      if (responses.length === 2) {
        const firstResponse = responses[0];
        const secondResponse = responses[1];

        t.deepEqual(firstResponse, {
          attachments: [{
            title: 'Do you wear jorts?',
            text: 'Yes'
          }],
          replace_original: true
        }, 'should restate the question with the answer attached');

        t.deepEqual(secondResponse, {
          attachments: ['jantsQuestion'],
          replace_original: false
        }, 'should follow up with the second attribute question');

        t.end();
      }

      return [200, 'hello'];
    });

  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jorts',
      response_url: 'https://example.com/a-response-url',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'yes',
        value: 'wears jorts'
      }],
      token: 'a-verification-token'
    })})
    .expect(200, () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jorts', 'wears jorts'), 'stores the attribute value');
      storeAttributeStub.restore();
    });
});

test('it handles a decline response to the first attribute question by storing it as null', function(t) {
  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jorts',
      response_url: 'https://example.com/a-response-url',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'irrelevant',
        value: 'decline'
      }],
      token: 'a-verification-token'
    })})
    .expect(200, () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jorts', null), 'clears the attribute value');
      storeAttributeStub.restore();
      t.end();
    });
});

test('it handles a response to the last attribute question by storing it, repeating the question and answer, and thanking', function(t) {
  const nock = require('nock');

  const responses = [];

  nock('https://example.com')
    .post('/a-response-url')
    .times(2)
    .reply((uri, requestBody) => {
      responses.push(JSON.parse(requestBody));

      if (responses.length === 2) {
        const firstResponse = responses[0];
        const secondResponse = responses[1];

        t.deepEqual(firstResponse, {
          attachments: [{
            title: 'Do you wear jants?',
            text: 'No'
          }],
          replace_original: true
        }, 'should restate the question with the answer attached');

        t.deepEqual(secondResponse, {
          text: 'Thanks for participating. See you around the Slack!',
          replace_original: false
        }, 'should end with a farewell');

        t.end();
      }

      return [200, 'hello'];
    });

  const storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  const retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  retrieveAttributeStub.withArgs('userID', 'jorts').returns(Promise.resolve('wears jorts'));
  retrieveAttributeStub.withArgs('userID', 'jants').returns(Promise.resolve('does not wear jants'));

  agent(startServer({attributeConfigurations, questionForAttributeConfiguration, userRepository: fakeUserRepository}))
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      callback_id: 'jants',
      response_url: 'https://example.com/a-response-url',
      user: {
        id: 'userID'
      },
      actions: [{
        name: 'irrelevant',
        value: 'does not wear jants'
      }],
      token: 'a-verification-token'
    })})
    .expect(200, () => {
      t.ok(storeAttributeStub.calledWith('userID', 'jants', 'does not wear jants'), 'stores the attribute value');
      storeAttributeStub.restore();
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
      }],
      token: 'a-verification-token'
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
      }],
      token: 'a-verification-token'
    })})
    .expect(200, 'Aww!', t.end);
});

test('it rejects an action without the correct verification token', function(t) {
  agent(startServer())
    .post('/slack/actions')
    .type('form')
    .send({payload: JSON.stringify({
      token: 'an-invalid-token'
    })})
    .expect(403, t.end);
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
