#!/usr/bin/env node --use-strict

var test = require('tape');

var selectTopKeys = require('../src/select-top-keys');

test('selectTopKeys selects the keys whose values are in the top N of all values', function(t) {
  t.deepEqual(selectTopKeys({a: 1, b: 0}, 1), ['a'], 'selects the top key');
  t.deepEqual(selectTopKeys({a: 2, b: 1, c: 0}, 2), ['a', 'b'], 'selects the top two keys');
  t.deepEqual(selectTopKeys({a: 2, b: 2}, 1), ['a', 'b'], 'selects two top keys when they have the same value');
  t.deepEqual(selectTopKeys({a: 2}, 2), ['a'], 'selects only one key when there is only one');
  t.deepEqual(selectTopKeys({}, 2), [], 'selects no keys when there are none');

  t.end();
});
