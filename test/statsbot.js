var test = require('tape');

var sinon = require('sinon');

var StatsBot = require('../src/statsbot');
var SlackAdapter = require('../src/slack-adapter');

var fakeClient = {
  on() {},
  login() {}
};

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
  t.plan(2);

  var adapter = new SlackAdapter(fakeClient);
  var bot = new StatsBot(adapter);

  var userStub = sinon.stub(adapter, 'getUser');
  userStub.withArgs('P').returns({name: 'Prakash'});
  userStub.withArgs('L').returns({name: 'Laura'});

  var prakashDM = {id: 'P-DM', send: sinon.stub()};
  var lauraDM = {id: 'L-DM', send: sinon.stub()};

  var channelByIDStub = sinon.stub(adapter, 'getChannel');
  channelByIDStub.withArgs(prakashDM.id).returns(prakashDM);
  channelByIDStub.withArgs(lauraDM.id).returns(lauraDM);

  bot.handleDirectMessage(prakashDM, {
    text: 'true'
  });

  t.ok(prakashDM.send.calledWith('Okay, we have noted that you are a man.'), 'replies affirming that Prakash is a man');

  bot.handleDirectMessage(lauraDM, {
    text: 'false'
  });

  t.ok(lauraDM.send.calledWith('Okay, we have noted that you are not a man.'), 'replies affirming that Laura is not a man');

  userStub.restore();
  channelByIDStub.restore();
});
