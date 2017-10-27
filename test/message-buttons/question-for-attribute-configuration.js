const test = require('tape');
const questionForAttributeConfiguration = require('../../src/message-buttons/question-for-attribute-configuration');

const attributeConfiguration = {
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

test('it translates an attribute configuration into a question', function(t) {
  t.deepEqual(questionForAttributeConfiguration(attributeConfiguration), {
    title: 'Do you wear jorts?',
    callback_id: 'jorts',
    attachment_type: 'default',
    actions: [{
      name: 'jorts',
      text: 'Yes',
      type: 'button',
      value: 'wears jorts'
    }, {
      name: 'jorts',
      text: 'No',
      type: 'button',
      value: 'does not wear jorts'
    }, {
      name: 'jorts',
      text: 'Sometimes',
      type: 'button',
      value: 'sometimes wears jorts'
    }, {
      name: 'jorts',
      text: 'Decline',
      type: 'button',
      value: 'decline'
    }]
  });

  t.end();
});
