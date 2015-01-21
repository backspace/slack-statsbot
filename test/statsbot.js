var test = require('tape');

var sinon = require('sinon');
var requireSubvert = require('require-subvert')(__dirname);

test('Constructing a StatsBot starts a SlackClient', function(t) {
  t.plan(2);

  var sandbox = sinon.sandbox.create().stub(process, 'env', {'SLACK_TOKEN': 'atoken'});

  var stub = sinon.stub();
  requireSubvert.subvert('slack-client', stub);

  var StatsBot = requireSubvert.require('../src/statsbot');
  var bot = new StatsBot();

  t.ok(stub.calledOnce, 'should call SlackClient constructor once');
  t.ok(stub.calledWith('atoken'), 'should construct SlackClient with environment variable token');

  sandbox.restore();
});
