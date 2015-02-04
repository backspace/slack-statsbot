var cronParser = require('cron-parser');

module.exports = function(interval, task) {
  var interval = cronParser.parseExpression(interval);

  function setNextTimeout() {
    var next = interval.next();
    var timeFromNow = next - new Date();

    setTimeout(function() {
      task();
      setNextTimeout();
    }, timeFromNow);
  };

  setNextTimeout();
}
