#!/usr/bin/env node --es_staging --use-strict

var test = require('tape');
var sinon = require('sinon');

var SlackAdapter = require('../src/slack-adapter');

var fakeClient = {
  login() {},
  on() {},
  getChannelGroupOrDMByID() {},
  getUserByID() {},
  getChannelByName() {},
};

var fakeBot = {
  handleChannelMessage() {},
  handleDirectMessage() {}
};

test('Constructing a SlackAdapter logs in to the client', function(t) {
  t.plan(1);

  var loginStub = sinon.stub(fakeClient, 'login');

  var adapter = new SlackAdapter(fakeClient);

  t.ok(loginStub.calledOnce, 'should call login()');

  loginStub.restore();
});

test('Constructing a SlackAdapter binds to events from the client', function(t) {
  t.plan(1);

  var onStub = sinon.stub(fakeClient, 'on');

  var adapter = new SlackAdapter(fakeClient);

  // TODO is there a way to test that a bound function is the argument? Unnecessary?
  // Could also test event emitter functionality
  t.ok(onStub.calledWith('message'), 'should observe client message events');

  onStub.restore();
});

test('SlackAdapter forwards categorised messages to the listener', function(t) {
  t.plan(2);

  var handleChannelMessageStub = sinon.stub(fakeBot, 'handleChannelMessage');
  var handleDirectMessageStub = sinon.stub(fakeBot, 'handleDirectMessage');

  var adapter = new SlackAdapter(fakeClient);
  adapter.registerListener(fakeBot);

  var channel = 'Channel';
  var dm = 'DM';

  var channelMessage = {
    getChannelType() { return 'Channel' },
    channel: channel
  };

  var directMessage = {
    getChannelType() { return 'DM' },
    channel: dm
  };

  var getChannelStub = sinon.stub(fakeClient, 'getChannelGroupOrDMByID');
  getChannelStub.withArgs('Channel').returns(channel);
  getChannelStub.withArgs('DM').returns(dm);

  adapter.messageReceived(channelMessage);
  t.ok(handleChannelMessageStub.calledWith(channel, channelMessage), 'should forward channel messages to the bot with the channel');

  adapter.messageReceived(directMessage);
  t.ok(handleDirectMessageStub.calledWith(dm, directMessage), 'should forward direct messages to the bot with the direct message channel');

  handleChannelMessageStub.restore();
  handleDirectMessageStub.restore();
  getChannelStub.restore();
});

test('SlackAdapter delegates getUser to the client', function(t) {
  t.plan(1);

  var id = 'userid';
  var user = 'a user';

  var getUserStub = sinon.stub(fakeClient, 'getUserByID');
  getUserStub.withArgs(id).returns(user);

  var adapter = new SlackAdapter(fakeClient);

  t.equal(adapter.getUser(id), user, 'should return the user from the client');

  getUserStub.restore();
});

test('SlackAdapter delegates getChannel to the client', function(t) {
  t.plan(1);

  var id = 'channelid';
  var channel = 'a channel';

  var getChannelStub = sinon.stub(fakeClient, 'getChannelGroupOrDMByID');
  getChannelStub.withArgs(id).returns(channel);

  var adapter = new SlackAdapter(fakeClient);

  t.equal(adapter.getChannel(id), channel, 'should return the channel from the client');

  getChannelStub.restore();
});

test('SlackAdapter delegates getChannelByName to the client', function(t) {
  t.plan(1);

  var name = 'channelname';
  var channel = 'a channel';

  var getChannelStub = sinon.stub(fakeClient, 'getChannelByName');
  getChannelStub.withArgs(name).returns(channel);

  var adapter = new SlackAdapter(fakeClient);

  t.equal(adapter.getChannelByName(name), channel, 'should return the channel from the client');

  getChannelStub.restore();
});
