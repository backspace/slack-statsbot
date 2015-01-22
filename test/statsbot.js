var test = require('tape');

var sinon = require('sinon');
var requireSubvert = require('require-subvert')(__dirname);

var fakeClient = {
  login() {},
  on() {},
  joinChannel() {},
  getChannelByID() {},
  getChannelByName() {},
  getChannelGroupOrDMByID() {},
  getUserByID() {}
};

test('Constructing a StatsBot starts a SlackClient and logs in', function(t) {
  t.plan(3);

  var sandbox = sinon.sandbox.create().stub(process, 'env', {'SLACK_TOKEN': 'atoken'});

  var client = fakeClient;
  var stub = sinon.stub().returns(client);
  requireSubvert.subvert('slack-client', stub);

  var mock = sinon.mock(client);
  mock.expects('login');

  var StatsBot = requireSubvert.require('../src/statsbot');
  var bot = new StatsBot();

  t.ok(stub.calledOnce, 'should call SlackClient constructor once');
  t.ok(stub.calledWith('atoken'), 'should construct SlackClient with environment variable token');

  t.ok(mock.verify(), 'should log in');

  sandbox.restore();
});

test('StatsBot reports a channel\'s message counts when requested', function(t) {
  t.plan(3);

  var client = fakeClient;

  var StatsBot = require('../src/statsbot');
  var bot = new StatsBot(client);

  var userStub = sinon.stub(client, 'getUserByID');
  userStub.withArgs('1').returns({name: 'Alice'});
  userStub.withArgs('2').returns({name: 'Bob'});

  var xenon = {id: 'Xe', name: 'Xenon', send: sinon.stub()};
  var ytterbium = {id: 'Yb', name: 'Ytterbium', send: sinon.stub()};

  var channelByIDStub = sinon.stub(client, 'getChannelByID');
  channelByIDStub.withArgs(xenon.id).returns(xenon);
  channelByIDStub.withArgs(ytterbium.id).returns(ytterbium);

  var channelByNameStub = sinon.stub(client, 'getChannelByName');
  channelByNameStub.withArgs(xenon.name).returns(xenon);
  channelByNameStub.withArgs(ytterbium.name).returns(ytterbium);

  bot.messageReceived({
    getChannelType() { return 'Channel' },
    user: '1',
    channel: 'Xe'
  });

  bot.messageReceived({
    getChannelType() { return 'Channel' },
    user: '2',
    channel: 'Xe'
  });

  bot.messageReceived({
    getChannelType() { return 'Channel' },
    user: '1',
    channel: 'Xe'
  });

  bot.messageReceived({
    getChannelType() { return 'Channel' },
    user: '1',
    channel: 'Yb'
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

  var client = fakeClient;

  var StatsBot = require('../src/statsbot');
  var bot = new StatsBot(client);

  var userStub = sinon.stub(client, 'getUserByID');
  userStub.withArgs('P').returns({name: 'Prakash'});
  userStub.withArgs('L').returns({name: 'Laura'});

  var prakashDM = {id: 'P-DM', send: sinon.stub()};
  var lauraDM = {id: 'L-DM', send: sinon.stub()};

  var channelByIDStub = sinon.stub(client, 'getChannelGroupOrDMByID');
  channelByIDStub.withArgs(prakashDM.id).returns(prakashDM);
  channelByIDStub.withArgs(lauraDM.id).returns(lauraDM);

  bot.messageReceived({
    getChannelType() { return 'DM' },
    user: 'P',
    channel: prakashDM.id,
    text: 'true'
  });

  t.ok(prakashDM.send.calledWith('Okay, we have noted that you are a man.'), 'replies affirming that Prakash is a man');

  bot.messageReceived({
    getChannelType() { return 'DM' },
    user: 'L',
    channel: lauraDM.id,
    text: 'false'
  });

  t.ok(lauraDM.send.calledWith('Okay, we have noted that you are not a man.'), 'replies affirming that Laura is not a man');

  userStub.restore();
  channelByIDStub.restore();
});
