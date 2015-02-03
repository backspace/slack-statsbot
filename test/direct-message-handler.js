#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');
var sinon = require('sinon');

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

var DirectMessageHandler = require('../src/direct-message-handler');

test('DirectMessageHandler updates whether or not the user is a man', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var janis = {id: 'J', name: 'Janis', isMan: false};
  var janisDM = {send: sinon.stub()};

  var buck = {id: 'B', name: 'Buck', isMan: true};
  var buckDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', isMan: 'what is this'};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[janis.id] = janisDM;
  personIDToChannel[buck.id] = buckDM;
  personIDToChannel[unknown.id] = unknownDM;

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  [janis, buck, unknown].forEach(function(person) {
    handler.handle(personIDToChannel[person.id], {
      text: `${person.isMan}`,
      user: person.id
    });
  });

  t.ok(janisDM.send.calledWith('Okay, we have noted that you are not a man. Say “true” if you are a man.'), 'replies affirming that Janis is not a man');
  t.ok(storeAttributeStub.calledWith(janis.id, 'isMan', false), 'stores that Janis is not a man');

  t.ok(buckDM.send.calledWith('Okay, we have noted that you are a man. Say “false” if that is not the case.'), 'replies affirming that Buck is a man');
  t.ok(storeAttributeStub.calledWith(buck.id, 'isMan', true), 'stores that Buck is a man');

  t.ok(unknownDM.send.calledWith('I’m sorry, I’m not that advanced and I didn’t understand your message. To come: actual help'), 'replies that it didn’t understand the message');
  t.ok(storeAttributeStub.neverCalledWith(unknown.id), 'does not store anything about Unknown');

  storeAttributeStub.restore();
  t.end();
});

test('DirectMessageHandler handles an information request', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var janis = {id: 'J', name: 'Janis', isMan: false};
  var janisDM = {send: sinon.stub()};

  var buck = {id: 'B', name: 'Buck', isMan: true};
  var buckDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', isMan: undefined};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[janis.id] = janisDM;
  personIDToChannel[buck.id] = buckDM;
  personIDToChannel[unknown.id] = unknownDM;

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  [janis, buck, unknown].forEach(function(person) {
    retrieveAttributeStub.withArgs(person.id, 'isMan').returns(Promise.resolve(person.isMan));

    handler.handle(personIDToChannel[person.id], {
      text: 'info',
      user: person.id
    });
  });

  setTimeout(function() {
    t.ok(janisDM.send.calledWith('We have you down here as not being a man.'), 'replies to Janis that she is not a man');
    t.ok(buckDM.send.calledWith('We have you down here as being a man.'), 'replies to Buck that he is a man');
    t.ok(unknownDM.send.calledWith('We don’t have you on record! Please say “true” if you are a man and “false” if you are not.'), 'replies to Unknown that they are unknown');

    t.end();
  }, 0);

  retrieveAttributeStub.restore();
});

test('DirectMessageHandler handles a help request', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var person = {id: 'P', name: 'Person'};
  var personDM = {send: sinon.stub()};

  // TODO testing the acceptance of title case here;
  // maybe should be split out into a command parser
  handler.handle(personDM, {
    text: 'Help',
    user: person.id
  });

  t.ok(personDM.send.calledWith('Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether a participant is a man or not. To come: actual help'), 'replies with a help message');

  t.end();
});
