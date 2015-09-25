#!/usr/bin/env node --use-strict

var test = require('tape');
var sinon = require('sinon');

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

var DirectMessageHandler = require('../src/direct-message-handler');

test('DirectMessageHandler updates whether or not the user is a man', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var janis = {id: 'J', name: 'Janis', manness: 'not a man'};
  var janisDM = {send: sinon.stub()};

  var buck = {id: 'B', name: 'Buck', manness: 'a man'};
  var buckDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', manness: 'what is this'};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[janis.id] = janisDM;
  personIDToChannel[buck.id] = buckDM;
  personIDToChannel[unknown.id] = unknownDM;

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  [janis, buck, unknown].forEach(function(person) {
    handler.handle(personIDToChannel[person.id], {
      text: `${person.manness}`,
      user: person.id
    });
  });

  t.ok(janisDM.send.calledWithMatch(/Okay, we have noted that you are not a man./), 'replies affirming that Janis is not a man');
  t.ok(storeAttributeStub.calledWith(janis.id, 'manness', 'not a man'), 'stores that Janis is not a man');

  t.ok(buckDM.send.calledWithMatch(/Okay, we have noted that you are a man./), 'replies affirming that Buck is a man');
  t.ok(storeAttributeStub.calledWith(buck.id, 'manness', 'a man'), 'stores that Buck is a man');

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

  var chris = {id: 'C', name: 'Chris', message: 'i am a person of colour'};
  var chrisDM = {send: sinon.stub()};

  var david = {id: 'D', name: 'David', message: 'I am white'};
  var davidDM = {send: sinon.stub()};

  var complicated = {id: 'Com', name: 'Complicated', message: 'it’s complicated whether I’m a person of colour'};
  var complicatedDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', pocness: 'what is this'};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[chris.id] = chrisDM;
  personIDToChannel[david.id] = davidDM;
  personIDToChannel[complicated.id] = complicatedDM;
  personIDToChannel[unknown.id] = unknownDM;

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  [chris, david, complicated, unknown].forEach(function(person) {
    handler.handle(personIDToChannel[person.id], {
      text: `${person.message}`,
      user: person.id
    });
  });

  t.ok(chrisDM.send.calledWithMatch(/you are a person of colour/), 'replies affirming that Chris is a person of colour');
  t.ok(storeAttributeStub.calledWith(chris.id, 'pocness', 'a PoC'), 'stores that Chris is a person of colour');

  t.ok(davidDM.send.calledWithMatch(/you are not a person of colour/), 'replies affirming that David is not a person of colour');
  t.ok(storeAttributeStub.calledWith(david.id, 'pocness', 'not a PoC'), 'stores that David is not a person of colour');

  t.ok(complicatedDM.send.calledWithMatch(/it’s complicated whether you are a person of colour/), 'replies affirming that it’s complicated whether Complicated is a person of colour');
  t.ok(storeAttributeStub.calledWith(complicated.id, 'pocness', 'complicated'), 'stores that it’s complicated whether Complicated is a person of colour');

  t.ok(unknownDM.send.calledWithMatch(/I’m sorry, I’m not that advanced and I didn’t understand your message./), 'replies that it didn’t understand the message');
  t.ok(storeAttributeStub.neverCalledWith(unknown.id), 'does not store anything about Unknown');

  storeAttributeStub.restore();
  t.end();
});

test('DirectMessageHandler handles an information request', function(t) {
  var handler = new DirectMessageHandler(fakeUserRepository);

  var janis = {id: 'J', name: 'Janis', 'manness': 'not a man', 'pocness': 'not a PoC'};
  var janisDM = {send: sinon.stub()};

  var buck = {id: 'B', name: 'Buck', 'manness': 'a man', 'pocness': 'not a PoC'};
  var buckDM = {send: sinon.stub()};

  var rocio = {id: 'R', name: 'Rocio', 'manness': 'not a man', 'pocness': 'a PoC'};
  var rocioDM = {send: sinon.stub()};

  var complicated = {id: 'C', name: 'Complicated', 'pocness': 'complicated'};
  var complicatedDM = {send: sinon.stub()};

  var unknown = {id: 'U', name: 'Unknown', 'manness': undefined};
  var unknownDM = {send: sinon.stub()};

  var personIDToChannel = {};
  personIDToChannel[janis.id] = janisDM;
  personIDToChannel[buck.id] = buckDM;
  personIDToChannel[rocio.id] = rocioDM;
  personIDToChannel[complicated.id] = complicatedDM;
  personIDToChannel[unknown.id] = unknownDM;

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  [janis, buck, rocio, complicated, unknown].forEach(function(person) {
    retrieveAttributeStub.withArgs(person.id, 'manness').returns(Promise.resolve(person.manness));
    retrieveAttributeStub.withArgs(person.id, 'pocness').returns(Promise.resolve(person.pocness));

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

      t.ok(complicatedDM.send.calledWithMatch(/it’s complicated whether you are a person of colour/), 'replies to Complicated that it’s recorded that it’s complicated whether they are a person of colour');
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

  t.ok(personDM.send.calledWithMatch(/Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in./), 'replies with a help message');

  t.end();
});
