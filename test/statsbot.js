#!/usr/bin/env node --use-strict

var test = require('tape');

var sinon = require('sinon');

var StatsBot = require('../src/statsbot');
var SlackAdapter = require('../src/slack-adapter');

var fakeClient = {
  on() {},
  login() {},
  getUserByID() {
    return {};
  }
};

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

var fakeChannelRepository = {
  retrieveIgnoredAttributes() { return []; }
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
  var bot = new StatsBot(adapter, {userRepository: fakeUserRepository, channelRepository: fakeChannelRepository}, {statsChannel: 'statsbot'});

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
  var bot = new StatsBot(adapter, {userRepository: fakeUserRepository, channelRepository: fakeChannelRepository}, {statsChannel: 'statsbot', reportingThreshold: 2});

  var alice = {id: '1', name: 'Alice', manness: 'a man', pocness: 'not a PoC'};
  var bob = {id: '2', name: 'Bob', manness: 'not a man', pocness: 'a PoC'};
  var carol = {id: '3', name: 'Carol', manness: 'a man', pocness: 'a PoC'};

  var userStub = sinon.stub(adapter, 'getUser');
  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  [alice, bob, carol].forEach(function(person) {
    userStub.withArgs(person.id).returns(person);
    retrieveAttributeStub.withArgs(person.id, 'manness').returns(Promise.resolve(person.manness));
    retrieveAttributeStub.withArgs(person.id, 'pocness').returns(Promise.resolve(person.pocness));
  });

  var xenon = {id: 'Xe', name: 'Xenon', send: sinon.stub()};
  var ytterbium = {id: 'Yb', name: 'Ytterbium', send: sinon.stub()};
  var zirconium = {id: 'Zr', name: 'Zirconium', send: sinon.stub()};
  var zinc = {id: 'Zn', name: 'Zinc', send: sinon.stub()};

  var botChannel = {id: 'Bot', name: 'statsbot', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');
  var retrieveIgnoredAttributesStub = sinon.stub(fakeChannelRepository, 'retrieveIgnoredAttributes');

  [xenon, ytterbium, zirconium, zinc, botChannel].forEach(function(channel) {
    channelByIDStub.withArgs(channel.id).returns(channel);

    if (channel === zirconium) {
      retrieveIgnoredAttributesStub.withArgs(channel.id).returns(['manness']);
    } else if (channel === zinc) {
      // TODO generalise this, it’s meant to have all attributes listed
      retrieveIgnoredAttributesStub.withArgs(channel.id).returns(['manness', 'pocness']);
    } else {
      retrieveIgnoredAttributesStub.withArgs(channel.id).returns([]);
    }
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

  bot.handleChannelMessage(zirconium, {
    user: alice.id,
    channel: zirconium.id
  });

  bot.handleChannelMessage(zirconium, {
    user: alice.id,
    channel: zirconium.id
  });

  bot.handleChannelMessage(zinc, {
    user: alice.id,
    channel: zinc.id
  });

  bot.handleChannelMessage(zinc, {
    user: alice.id,
    channel: zinc.id
  });

  bot.reportChannelStatistics(botChannel.id);
  bot.reportChannelStatistics('Yb');
  bot.reportChannelStatistics('Xe');
  bot.reportChannelStatistics('Zr');
  bot.reportChannelStatistics('Zn');

  setTimeout(function() {
    t.ok(botChannel.send.neverCalledWithMatch(/#statsbot/), 'does not report on the stats channel statistics');

    t.ok(botChannel.send.calledWithMatch(/#Yb/), 'reports #Ytterbium statistics in the bot channel');
    t.ok(botChannel.send.calledWithMatch(/^.*counts.*2.*$/m), 'reports a message count of 2');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*100%.*$/m), 'reports that only men spoke in one channel');
    t.ok(botChannel.send.calledWithMatch(/^.*PoC.*0%.*$/m), 'reports that no people of colour spoke in one channel');
    t.ok(botChannel.send.calledWithMatch(/^.*not-PoC.*100%.*$/m), 'reports that only non-PoC spoke in one channel');

    t.ok(ytterbium.send.calledWithMatch(/not-men sent 0% of messages/), 'reports in the channel that not-men sent no messages');
    t.ok(ytterbium.send.calledWithMatch(/people of colour sent 0% of messages/), 'reports in the channel that people of colour sent no messages');
    t.ok(ytterbium.send.calledWithMatch(/:sb-100::sb-00::sb-00:/), 'reports compactly in the channel that men dominated');
    t.ok(ytterbium.send.calledWithMatch(/:sb-00::sb-100::sb-00:/), 'reports compactly in the channel that non-PoC dominated');

    t.ok(botChannel.send.calledWithMatch(/#Xe/), 'reports #Xenon statistics in the bot channel');
    t.ok(botChannel.send.calledWithMatch(/^.*counts.*3.*$/m), 'reports a message count of 3');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*67%.*$/m), 'reports that men spoke ⅔ of the time in the other channel');
    t.ok(botChannel.send.calledWithMatch(/^.*not-men.*33%.*$/m), 'reports that not-men spoke ⅓ of the time in the other channel');

    t.ok(botChannel.send.calledWithMatch(/^.*counts.*3.*$/m), 'reports that there were 3 participants');
    t.ok(botChannel.send.calledWithMatch(/^.*men.*67%.*$/m), 'reports that men made up 67% of participants');
    t.ok(botChannel.send.calledWithMatch(/^.*not-men.*33%.*$/m), 'reports that not-men made up 33% of participants');

    t.ok(xenon.send.calledWithMatch(/not-men sent 33% of messages/), 'reports in the channel that not-men sent 33% of messages');
    t.ok(xenon.send.calledWithMatch(/people of colour sent 67% of messages/), 'reports in the channel that people of colour sent 67% of messages');
    t.ok(xenon.send.calledWithMatch(/:sb-65::sb-35::sb-00:/), 'reports compactly in the channel that men dominated');
    t.ok(xenon.send.calledWithMatch(/:sb-65::sb-35::sb-00:/), 'reports compactly in the channel that non-PoC did not dominate');

    t.ok(zirconium.send.calledWithMatch(/people of colour/), 'reports about people of colour in the channel with an ignored attribute');
    t.ok(zirconium.send.neverCalledWithMatch(/not-men/), 'does not report about not-men in the channel with an ignored attribute');

    t.equal(zinc.send.callCount, 0, 'does not report when a channel has all attributes ignored');

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

  var bot = new StatsBot(adapter, {userRepository: fakeUserRepository, channelRepository: fakeChannelRepository}, {statsChannel: 'statsbot', topUnknownsToQuery: 2});

  var known = {id: '1', name: 'Known', manness: 'a man', pocness: 'a person of colour'};
  var topUnknown = {id: 'u1', name: 'Unknown 1', manness: undefined};
  var declinedUnknown = {id: 'u2', name: 'Unknown 2', manness: undefined, hasBeenQueried: true};
  var nextUnknown = {id: 'u3', name: 'Unknown 3', manness: undefined};
  var bottomUnknown = {id: 'u4', name: 'Unknown 4', manness: undefined};

  var personToDM = new Map();

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');
  var dmByUserStub = sinon.stub(adapter, 'getDMByUser');

  [known, topUnknown, declinedUnknown, nextUnknown, bottomUnknown].forEach(function(person) {
    var dm = {send: sinon.stub()};
    personToDM.set(person, dm);

    retrieveAttributeStub.withArgs(person.id, 'manness').returns(Promise.resolve(person.manness));
    // Use manness as pocness for this test
    retrieveAttributeStub.withArgs(person.id, 'pocness').returns(Promise.resolve(person.pocness || person.pocness));
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
    t.equal(personToDM.get(topUnknown).send.calledOnce, true, 'DMed the top unknown only once');
    t.equal(personToDM.get(declinedUnknown).send.called, false, 'did not DM the person who declined to self-identify');
    t.equal(personToDM.get(nextUnknown).send.calledOnce, true, 'DMed the second-to-top unknown only once');
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
  var bot = new StatsBot(adapter, {userRepository: fakeUserRepository});

  var prakash = {id: 'P', name: 'Prakash'};
  var laura = {id: 'L', name: 'Laura'};
  var janet = {id: 'J', name: 'Janet'};

  var userStub = sinon.stub(adapter, 'getUser');
  [prakash, laura, janet].forEach(function(person) {
    userStub.withArgs(person.id).returns(person);
  });

  var prakashDM = {id: 'P-DM', send: sinon.stub()};
  var lauraDM = {id: 'L-DM', send: sinon.stub()};
  var janetDM = {id: 'J-DM', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');
  channelByIDStub.withArgs(prakashDM.id).returns(prakashDM);
  channelByIDStub.withArgs(lauraDM.id).returns(lauraDM);
  channelByIDStub.withArgs(janetDM.id).returns(janetDM);

  var storeAttributeStub = sinon.stub(fakeUserRepository, 'storeAttribute');

  bot.handleDirectMessage(prakashDM, {
    text: 'true',
    user: prakash.id
  });

  t.ok(prakashDM.send.calledWithMatch(/Okay, we have noted that you are a man./), 'replies affirming that Prakash is a man');
  t.ok(storeAttributeStub.calledWith('P', 'manness', 'a man'), 'stores that Prakash is a man');

  bot.handleDirectMessage(prakashDM, {
    text: 'i am a person of colour',
    user: prakash.id
  });

  t.ok(prakashDM.send.calledWithMatch(/you are a person of colour/), 'replies affirming that Prakash is a person of colour');
  t.ok(storeAttributeStub.calledWith('P', 'pocness', 'a PoC'), 'stores that Prakash is a person of colour');

  bot.handleDirectMessage(janetDM, {
    text: 'I am a woman',
    user: janet.id
  });

  t.ok(janetDM.send.calledWithMatch(/Okay, we have noted that you are not a man./), 'replies affirming that Janet is not a man');
  t.ok(storeAttributeStub.calledWith('J', 'manness', 'not a man'), 'stores that Janet is not a man');

  bot.handleDirectMessage(lauraDM, {
    text: 'false',
    user: laura.id
  });

  t.ok(lauraDM.send.calledWithMatch(/Okay, we have noted that you are not a man./), 'replies affirming that Laura is not a man');
  t.ok(storeAttributeStub.calledWith('L', 'manness', 'not a man'), 'stores that Laura is not a man');

  bot.handleDirectMessage(lauraDM, {
    text: 'i am white',
    user: laura.id
  });

  t.ok(lauraDM.send.calledWithMatch(/you are not a person of colour/), 'replies affirming that Laura is not a person of colour');
  t.ok(storeAttributeStub.calledWith('L', 'pocness', 'not a PoC'), 'stores that Laura is not a person of colour');

  userStub.restore();
  channelByIDStub.restore();
  storeAttributeStub.restore();

  t.end();
});

test('StatsBot responds with a user\'s information when they ask', function(t) {
  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, {userRepository: fakeUserRepository});

  var shane = {id: 'S', name: 'Shane'};
  var shaneDM = {send: sinon.stub()};

  var kama = {id: 'K', name: 'Kama'};
  var kamaDM = {send: sinon.stub()};

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  retrieveAttributeStub.withArgs(shane.id, 'manness').returns(Promise.resolve('a man'));
  retrieveAttributeStub.withArgs(shane.id, 'pocness').returns(Promise.resolve('not a PoC'));

  retrieveAttributeStub.withArgs(kama.id, 'manness').returns(Promise.resolve(null));
  retrieveAttributeStub.withArgs(kama.id, 'pocness').returns(Promise.resolve(null));

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
