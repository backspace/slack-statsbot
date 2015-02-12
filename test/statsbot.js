#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var sinon = require('sinon');

var StatsBot = require('../src/statsbot');
var SlackAdapter = require('../src/slack-adapter');

var fakeClient = {
  on() {},
  login() {}
};

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

// TODO these are a weird mix of unit and acceptance tests

test('Constructing a StatsBot registers it with the adapter', function(t) {
  t.plan(1);

  var fakeAdapter = {
    registerListener() {}
  };

  var registerListenerStub = sinon.stub(fakeAdapter, 'registerListener');

  var bot = new StatsBot(fakeAdapter);

  t.ok(registerListenerStub.calledWith(bot), 'should register itself as a listener');
});

test('StatsBot announces in its channel that it has started', function(t) {
  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, fakeUserRepository, {statsChannel: 'statsbot'});

  var botChannel = {id: 'Bot', name: 'statsbot', send: sinon.stub()};

  var channelByNameStub = sinon.stub(adapter, 'getChannelByName');
  channelByNameStub.withArgs(botChannel.name).returns(botChannel);

  adapter.connected();

  t.ok(botChannel.send.calledWithMatch(/I just started up!/), 'should announce that it started up');

  channelByNameStub.restore();

  t.end();
});
test('StatsBot reports a channel\'s message counts when requested', function(t) {
  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, fakeUserRepository, {statsChannel: 'statsbot', reportingThreshold: 2});

  var alice = {id: '1', name: 'Alice', isMan: true, isPersonOfColour: false};
  var bob = {id: '2', name: 'Bob', isMan: false, isPersonOfColour: true};
  var carol = {id: '3', name: 'Carol', isMan: true, isPersonOfColour: true};

  var userStub = sinon.stub(adapter, 'getUser');
  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  [alice, bob, carol].forEach(function(person) {
    userStub.withArgs(person.id).returns(person);
    retrieveAttributeStub.withArgs(person.id, 'isMan').returns(Promise.resolve(person.isMan));
    retrieveAttributeStub.withArgs(person.id, 'isPersonOfColour').returns(Promise.resolve(person.isPersonOfColour));
  });

  var xenon = {id: 'Xe', name: 'Xenon', send: sinon.stub()};
  var ytterbium = {id: 'Yb', name: 'Ytterbium', send: sinon.stub()};

  var botChannel = {id: 'Bot', name: 'statsbot', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');

  [xenon, ytterbium, botChannel].forEach(function(channel) {
    channelByIDStub.withArgs(channel.id).returns(channel);
  });

  var channelByNameStub = sinon.stub(adapter, 'getChannelByName');

  channelByNameStub.withArgs(botChannel.name).returns(botChannel);

  bot.handleChannelMessage(botChannel, {
    user: bob.id,
    channel: botChannel.id
  });

  bot.handleChannelMessage(xenon, {
    user: alice.id,
    channel: xenon.id
  });

  bot.handleChannelMessage(xenon, {
    user: bob.id,
    channel: xenon.id
  });

  bot.handleChannelMessage(xenon, {
    user: carol.id,
    channel: xenon.id,
    subtype: 'me_message'
  });

  bot.handleChannelMessage(xenon, {
    user: alice.id,
    channel: xenon.id,
    subtype: 'message_changed'
  });

  bot.handleChannelMessage(ytterbium, {
    user: alice.id,
    channel: ytterbium.id
  });

  bot.handleChannelMessage(ytterbium, {
    user: alice.id,
    channel: ytterbium.id
  });

  bot.reportChannelStatistics(botChannel.id);
  bot.reportChannelStatistics('Yb');
  bot.reportChannelStatistics('Xe');

  setTimeout(function() {
    t.ok(botChannel.send.neverCalledWithMatch(/#statsbot/), 'does not report on the stats channel statistics');

    t.ok(botChannel.send.calledWithMatch(/#Ytterbium/), 'reports #Ytterbium statistics in the bot channel');
    t.ok(botChannel.send.calledWithMatch(/^.*counts.*2.*$/m), 'reports a message count of 2');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*100%.*$/m), 'reports that only men spoke in one channel');
    t.ok(botChannel.send.calledWithMatch(/^.*PoC.*0%.*$/m), 'reports that no people of colour spoke in one channel');
    t.ok(botChannel.send.calledWithMatch(/^.*not-PoC.*100%.*$/m), 'reports that only non-PoC spoke in one channel');

    t.ok(ytterbium.send.calledWithMatch(/not-men sent 0% of messages/), 'reports in the channel that not-men sent no messages');
    t.ok(ytterbium.send.calledWithMatch(/people of colour sent 0% of messages/), 'reports in the channel that people of colour sent no messages');

    t.ok(botChannel.send.calledWithMatch(/#Xenon/), 'reports #Xenon statistics in the bot channel');
    t.ok(botChannel.send.calledWithMatch(/^.*counts.*3.*$/m), 'reports a message count of 3');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*67%.*$/m), 'reports that men spoke ⅔ of the time in the other channel');
    t.ok(botChannel.send.calledWithMatch(/^.*not-men.*33%.*$/m), 'reports that not-men spoke ⅓ of the time in the other channel');

    t.ok(botChannel.send.calledWithMatch(/^.*counts.*3.*$/m), 'reports that there were 3 participants');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*67%.*$/m), 'reports that men made up 67% of participants');
    t.ok(botChannel.send.calledWithMatch(/^.*not-men.*33%.*$/m), 'reports that not-men made up 33% of participants');

    t.ok(xenon.send.calledWithMatch(/not-men sent 33% of messages/), 'reports in the channel that not-men sent 33% of messages');
    t.ok(xenon.send.calledWithMatch(/people of colour sent 67% of messages/), 'reports in the channel that people of colour sent 67% of messages');

    bot.handleChannelMessage(xenon, {
      user: alice.id,
      channel: xenon.id
    });

    bot.reportChannelStatistics('Xe');

    setTimeout(function() {
      t.ok(xenon.send.neverCalledWithMatch(/0%/), 'starts the statistics over after reporting but does not report when the message count is below the threshold');

      bot.handleChannelMessage(xenon, {
        user: alice.id,
        channel: xenon.id
      });

      bot.reportChannelStatistics('Xe');

      setTimeout(function() {
        t.ok(xenon.send.calledWithMatch(/0%/), 'does report when the threshold has been reached');

        userStub.restore();
        channelByIDStub.restore();
        channelByNameStub.restore();
        retrieveAttributeStub.restore();

        t.end();
      }, 0);
    }, 0);
  }, 0);
});

// FIXME obvs these tests are out of control!

test('StatsBot asks the top two unknowns in a reporting period who have not declined to self-identify', function(t) {
  var adapter = new SlackAdapter(fakeClient);

  var bot = new StatsBot(adapter, fakeUserRepository, {statsChannel: 'statsbot', topUnknownsToQuery: 2});

  var known = {id: '1', name: 'Known', isMan: true};
  var topUnknown = {id: 'u1', name: 'Unknown 1', isMan: undefined};
  var declinedUnknown = {id: 'u2', name: 'Unknown 2', isMan: undefined, hasBeenQueried: true};
  var nextUnknown = {id: 'u3', name: 'Unknown 3', isMan: undefined};
  var bottomUnknown = {id: 'u4', name: 'Unknown 4', isMan: undefined};

  var personToDM = new Map();

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');
  var dmByUserStub = sinon.stub(adapter, 'getDMByUser');

  [known, topUnknown, declinedUnknown, nextUnknown, bottomUnknown].forEach(function(person) {
    var dm = {send: sinon.stub()};
    personToDM.set(person, dm);

    retrieveAttributeStub.withArgs(person.id, 'isMan').returns(Promise.resolve(person.isMan));
    retrieveAttributeStub.withArgs(person.id, 'hasBeenQueried').returns(Promise.resolve(person.hasBeenQueried));

    dmByUserStub.withArgs(person.id).returns(dm);
  });

  var channel = {id: 'Channel', name: 'Channel', send: sinon.stub()};
  var botChannel = {id: 'Bot', name: 'statsbot', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');

  [channel, botChannel].forEach(function(channel) {
    channelByIDStub.withArgs(channel.id).returns(channel);
  });

  var channelByNameStub = sinon.stub(adapter, 'getChannelByName');

  channelByNameStub.withArgs(botChannel.name).returns(botChannel);

  function sendMessageFrom(person) {
    bot.handleChannelMessage(channel, {
      user: person.id,
      channel: channel.id
    });
  }

  function sendMessagesFrom(person, count) {
    for (let i = 0; i < count; i++) {
      sendMessageFrom(person);
    }
  }

  sendMessagesFrom(known, 5);
  sendMessagesFrom(topUnknown, 4);
  sendMessagesFrom(declinedUnknown, 4);
  sendMessagesFrom(nextUnknown, 3);
  sendMessagesFrom(bottomUnknown, 2);

  bot.reportChannelStatistics(channel.id);

  setTimeout(function() {
    t.equal(personToDM.get(known).send.called, false, 'did not DM the person whose gender was known');
    t.equal(personToDM.get(topUnknown).send.called, true, 'DMed the top unknown');
    t.equal(personToDM.get(declinedUnknown).send.called, false, 'did not DM the person who declined to self-identify');
    t.equal(personToDM.get(nextUnknown).send.called, true, 'DMed the second-to-top unknown');
    t.equal(personToDM.get(bottomUnknown).send.called, false, 'did not DM the third-to-top unknown');

    t.ok(storeAttributeStub.calledWith(topUnknown.id, 'hasBeenQueried', true), 'stores that the top unknown has been queried');
    t.ok(storeAttributeStub.calledWith(nextUnknown.id, 'hasBeenQueried', true), 'stores that the second-to-top unknown has been queried');

    retrieveAttributeStub.restore();
    storeAttributeStub.restore();
    dmByUserStub.restore();
    channelByIDStub.restore();

    t.end();
  });
});

test('StatsBot records a user\'s gender and race', function(t) {
  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, fakeUserRepository);

  var prakash = {id: 'P', name: 'Prakash'};
  var laura = {id: 'L', name: 'Laura'};

  var userStub = sinon.stub(adapter, 'getUser');
  [prakash, laura].forEach(function(person) {
    userStub.withArgs(person.id).returns(person);
  });

  var prakashDM = {id: 'P-DM', send: sinon.stub()};
  var lauraDM = {id: 'L-DM', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');
  channelByIDStub.withArgs(prakashDM.id).returns(prakashDM);
  channelByIDStub.withArgs(lauraDM.id).returns(lauraDM);

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  bot.handleDirectMessage(prakashDM, {
    text: 'true',
    user: prakash.id
  });

  t.ok(prakashDM.send.calledWithMatch(/Okay, we have noted that you are a man./), 'replies affirming that Prakash is a man');
  t.ok(storeAttributeStub.calledWith('P', 'isMan', true), 'stores that Prakash is a man');

  bot.handleDirectMessage(prakashDM, {
    text: 'i am a person of colour',
    user: prakash.id
  });

  t.ok(prakashDM.send.calledWithMatch(/you are a person of colour/), 'replies affirming that Prakash is a person of colour');
  t.ok(storeAttributeStub.calledWith('P', 'isPersonOfColour', true), 'stores that Prakash is a person of colour');

  bot.handleDirectMessage(lauraDM, {
    text: 'false',
    user: laura.id
  });

  t.ok(lauraDM.send.calledWithMatch(/Okay, we have noted that you are not a man./), 'replies affirming that Laura is not a man');
  t.ok(storeAttributeStub.calledWith('L', 'isMan', false), 'stores that Laura is not a man');

  bot.handleDirectMessage(lauraDM, {
    text: 'i am white',
    user: laura.id
  });

  t.ok(lauraDM.send.calledWithMatch(/you are not a person of colour/), 'replies affirming that Laura is not a person of colour');
  t.ok(storeAttributeStub.calledWith('L', 'isPersonOfColour', false), 'stores that Laura is not a person of colour');

  userStub.restore();
  channelByIDStub.restore();
  storeAttributeStub.restore();

  t.end();
});

test('StatsBot responds with a user\'s information when they ask', function(t) {
  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, fakeUserRepository);

  var shane = {id: 'S', name: 'Shane'};
  var shaneDM = {send: sinon.stub()};

  var kama = {id: 'K', name: 'Kama'};
  var kamaDM = {send: sinon.stub()};

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  retrieveAttributeStub.withArgs(shane.id, 'isMan').returns(Promise.resolve(true));
  retrieveAttributeStub.withArgs(shane.id, 'isPersonOfColour').returns(Promise.resolve(false));

  retrieveAttributeStub.withArgs(kama.id, 'isMan').returns(Promise.resolve(null));
  retrieveAttributeStub.withArgs(kama.id, 'isPersonOfColour').returns(Promise.resolve(null));

  bot.handleDirectMessage(shaneDM, {
    text: 'info',
    user: shane.id
  });

  bot.handleDirectMessage(kamaDM, {
    text: 'info',
    user: kama.id
  });

  setTimeout(function() {
    t.ok(shaneDM.send.calledWithMatch(/you are a man/), 'replies to Shane that he is recorded as a man');
    t.ok(shaneDM.send.calledWithMatch(/you are not a person of colour/), 'replies to Shane that he is recorded as not being a person of colour');
    t.ok(kamaDM.send.calledWithMatch(/We don’t have you on record!/), 'replies to Kama that they are unknown');

    retrieveAttributeStub.restore();

    t.end();
  }, 0);
});
