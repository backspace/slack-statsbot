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

test('StatsBot reports a channel\'s message counts when requested', function(t) {
  t.plan(3);

  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter);

  var alice = {id: '1', name: 'Alice'};
  var bob = {id: '2', name: 'Bob'};

  var userStub = sinon.stub(adapter, 'getUser');
  [alice, bob].forEach(function(person) {
    userStub.withArgs(person.id).returns(person);
  });

  var xenon = {id: 'Xe', name: 'Xenon', send: sinon.stub()};
  var ytterbium = {id: 'Yb', name: 'Ytterbium', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');
  var channelByNameStub = sinon.stub(adapter, 'getChannelByName');

  [xenon, ytterbium].forEach(function(channel) {
    channelByIDStub.withArgs(channel.id).returns(channel);
    channelByNameStub.withArgs(channel.name).returns(channel);
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
    user: alice.id,
    channel: xenon.id
  });

  bot.handleChannelMessage(ytterbium, {
    user: alice.id,
    channel: ytterbium.id
  });

  bot.reportChannelStatistics('Ytterbium');

  t.ok(ytterbium.send.calledWith('Alice message count in #Ytterbium: 1'), 'reports Alice\'s message count in one channel');

  bot.reportChannelStatistics('Xenon');

  t.ok(xenon.send.calledWith('Alice message count in #Xenon: 2'), 'reports Alice\'s message count the other channel');
  t.ok(xenon.send.calledWith('Bob message count in #Xenon: 1'), 'reports Bob\'s message count in the other channel');

  userStub.restore();
  channelByIDStub.restore();
  channelByNameStub.restore();
});

test('StatsBot records a user\'s gender', function(t) {
  t.plan(4);

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

  t.ok(prakashDM.send.calledWith('Okay, we have noted that you are a man.'), 'replies affirming that Prakash is a man');
  t.ok(storeAttributeStub.calledWith('P', 'isMan', true), 'stores that Prakash is a man');

  bot.handleDirectMessage(lauraDM, {
    text: 'false',
    user: laura.id
  });

  t.ok(lauraDM.send.calledWith('Okay, we have noted that you are not a man.'), 'replies affirming that Laura is not a man');
  t.ok(storeAttributeStub.calledWith('L', 'isMan', false), 'stores that Laura is not a man');

  userStub.restore();
  channelByIDStub.restore();
  storeAttributeStub.restore();
});

test('StatsBot responds with a user\'s gender when they ask', function(t) {
  t.plan(1);

  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter, fakeUserRepository);

  var shane = {id: 'S', name: 'Shane'};
  var shaneDM = {send: sinon.stub()};

  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');
  retrieveAttributeStub.withArgs(shane.id, 'isMan').returns(Promise.resolve(true));

  bot.handleDirectMessage(shaneDM, {
    text: 'info',
    user: shane.id
  });

  setTimeout(function() {
    t.ok(shaneDM.send.calledWith('We have you down here as being a man.'), 'replies to Shane that he is recorded as a man');

    retrieveAttributeStub.restore();
  }, 0);
});
