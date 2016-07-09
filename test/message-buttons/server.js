const startServer = require('../../src/message-buttons/server');
const agent = require('supertest-koa-agent');

const test = require('tape');
const sinon = require('sinon');

const firstAttributeConfiguration = {
  name: 'jorts',
  interviewQuestion: 'Do you wear jorts?',
  values: [{
    value: 'wears jorts',
    texts: {
      interviewAnswer: 'Yes'
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

const attributeConfigurations = [
  firstAttributeConfiguration
];

function questionForAttributeConfiguration() {
  return 'a question';
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
    .expect(200, questionForAttributeConfiguration(), t.end);
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
