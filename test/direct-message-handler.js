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

  t.ok(janisDM.send.calledWithMatch(/Okay, we have noted that you are not a man./), 'replies affirming that Janis is not a man');
  t.ok(storeAttributeStub.calledWith(janis.id, 'isMan', false), 'stores that Janis is not a man');

  t.ok(buckDM.send.calledWithMatch(/Okay, we have noted that you are a man./), 'replies affirming that Buck is a man');
  t.ok(storeAttributeStub.calledWith(buck.id, 'isMan', true), 'stores that Buck is a man');

  t.ok(unknownDM.send.calledWithMatch(/I’m sorry, I’m not that advanced and I didn’t understand your message./), 'replies that it didn’t understand the message');
  t.ok(storeAttributeStub.neverCalledWith(unknown.id), 'does not store anything about Unknown');

  storeAttributeStub.restore();
  t.end();
});

test('DirectMessageHandler updates whether the user is a person of colour', function(t) {
  // TODO reduce setup boilerplate
  // but this is all too acceptance-like and redundant and should just test
  // that the parsers are called and their results are used
  var handler = new DirectMessageHandler(fakeUserRepository);

  var chris = {id: 'C', name: 'Chris', isPersonOfColour: true, message: 'i am a person of colour'};
  var chrisDM = {send: sinon.stub()};

  var david = {id: 'D', name: 'David', isPersonOfColour: false, message: 'I am white'};
  var davidDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', isMan: 'what is this'};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[chris.id] = chrisDM;
  personIDToChannel[david.id] = davidDM;
  personIDToChannel[unknown.id] = unknownDM;

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  [chris, david, unknown].forEach(function(person) {
    handler.handle(personIDToChannel[person.id], {
      text: `${person.message}`,
      user: person.id
    });
  });

  t.ok(chrisDM.send.calledWithMatch(/you are a person of colour/), 'replies affirming that Chris is a person of colour');
  t.ok(storeAttributeStub.calledWith(chris.id, 'isPersonOfColour', true), 'stores that Chris is a person of colour');

  t.ok(davidDM.send.calledWithMatch(/you are not a person of colour/), 'replies affirming that David is not a person of colour');
  t.ok(storeAttributeStub.calledWith(david.id, 'isPersonOfColour', false), 'stores that David is not a person of colour');

  t.ok(unknownDM.send.calledWithMatch(/I’m sorry, I’m not that advanced and I didn’t understand your message./), 'replies that it didn’t understand the message');
  t.ok(storeAttributeStub.neverCalledWith(unknown.id), 'does not store anything about Unknown');

  storeAttributeStub.restore();
  t.end();
});

test('DirectMessageHandler handles an information request', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var janis = {id: 'J', name: 'Janis', isMan: false, isPersonOfColour: false};
  var janisDM = {send: sinon.stub()};

  var buck = {id: 'B', name: 'Buck', isMan: true, isPersonOfColour: false};
  var buckDM = {send: sinon.stub()};

  var rocio = {id: 'R', name: 'Rocio', isMan: false, isPersonOfColour: true};
  var rocioDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', isMan: undefined};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[janis.id] = janisDM;
  personIDToChannel[buck.id] = buckDM;
  personIDToChannel[rocio.id] = rocioDM;
  personIDToChannel[unknown.id] = unknownDM;

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  [janis, buck, rocio, unknown].forEach(function(person) {
    retrieveAttributeStub.withArgs(person.id, 'isMan').returns(Promise.resolve(person.isMan));
    retrieveAttributeStub.withArgs(person.id, 'isPersonOfColour').returns(Promise.resolve(person.isPersonOfColour));

    handler.handle(personIDToChannel[person.id], {
      text: 'info',
      user: person.id
    });
  });

  setTimeout(function() {
    setTimeout(function() {
      t.ok(janisDM.send.calledWithMatch(/you are not a man/), 'replies to Janis that she is recorded as not a man');
      t.ok(janisDM.send.calledWithMatch(/you are not a person of colour/), 'replies to Janis that she is not a person of colour');

      t.ok(buckDM.send.calledWithMatch(/you are a man/), 'replies to Buck that he is recorded as a man');

      t.ok(rocioDM.send.calledWithMatch(/you are a person of colour/), 'replies to Rocio that she is recorded as a person of colour');

      t.ok(unknownDM.send.calledWithMatch(/We don’t have you on record!/), 'replies to Unknown that they are unknown');

      t.end();
    }, 0);
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

  t.ok(personDM.send.calledWithMatch(/Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether a participant is a man or not./), 'replies with a help message');

  t.end();
});
