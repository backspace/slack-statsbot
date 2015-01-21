var test = require('tape');

var sinon = require('sinon');
var requireSubvert = require('require-subvert')(__dirname);

test('Constructing a StatsBot starts a SlackClient and logs in', function(t) {
  t.plan(3);

  var sandbox = sinon.sandbox.create().stub(process, 'env', {'SLACK_TOKEN': 'atoken'});

  var client = {login: function() {}, on: function() {}};
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

test('StatsBot joins #bot after login', function(t) {
  t.plan(2);

  var client = {login: function() {}, on: function() {}, joinChannel: function() {}};

  var spy = sinon.spy(client, 'joinChannel');

  var StatsBot = require('../src/statsbot');
  var bot = new StatsBot(client);
  bot.loggedIn();

  t.ok(spy.calledOnce, 'should call joinChannel');
  t.ok(spy.calledWith('bot'), 'should join #bot');
});
