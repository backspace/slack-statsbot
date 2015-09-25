#!/usr/bin/env node --use-strict

var test = require('tape');

var percentagesFromCounts = require('../../src/calculators/percentages-from-counts');

test('PercentagesFromCounts converts counts to percents', function(t) {
  var simple = {
    one: 1,
    two: 1
  };

  var simplePercents = {
    one: '50',
    two: '50'
  };

  t.deepEqual(percentagesFromCounts(simple), simplePercents, 'calculates simple percentages');

  var rounded = {
    one: 1,
    two: 2
  };

  var roundedPercents = {
    one: '33',
    two: '67'
  };

  t.deepEqual(percentagesFromCounts(rounded), roundedPercents, 'calculates rounded percentages');

  t.end();
});
