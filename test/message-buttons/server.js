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
