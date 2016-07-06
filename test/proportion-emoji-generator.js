const test = require('tape');
const generator = require('../src/proportion-emoji-generator');

test('ProportionEmojiGenerator generators emoji along the scale', function(t) {
  t.equal(generator(0), ':sb-00:');
  t.equal(generator(0.01), ':sb-00:', 'expected it to round down when closer');
  t.equal(generator(0.03), ':sb-05:', 'expected it to round up when closesr');
  t.equal(generator(0.1), ':sb-10:');
  t.equal(generator(0.99), ':sb-100:');
  t.equal(generator(1), ':sb-100:');

  t.equal(generator(-5), ':sb-00:', 'expected a value below the valid range to be equivalent to 0');
  t.equal(generator(1.5), ':sb-100:', 'expected a value above the valid range to be equivalent to 1');

  t.end();
});
