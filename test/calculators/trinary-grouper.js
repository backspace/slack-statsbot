#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var trinaryGrouper = require('../../src/calculators/trinary-grouper');

test('trinaryGrouper groups counts by attribute value', function(t) {
  var statistics = {
    'Is tasty': 4,
    'Is also tasty': 3,
    'Not tasty': 2,
    'Tastiness unknown': 1
  };

  var isTasty = {
    'Is tasty': true,
    'Is also tasty': true,
    'Not tasty': false,
    'Tastiness unknown': undefined
  };

  var mappings = {
    'true': 'tasties',
    'false': 'notTasties',
    'else': 'mysterious'
  };

  var result = trinaryGrouper(statistics, isTasty, mappings);

  t.equal(result.tasties, 7, 'counts 7 from tasties');
  t.equal(result.notTasties, 2, 'counts 2 from non-tasties');
  t.equal(result.mysterious, 1, 'counts 1 from mysterious');

  t.end();
});
