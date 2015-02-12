#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var trinaryCounter = require('../../src/calculators/trinary-counter');

test('trinaryCounter counts by attribute value', function(t) {
  var statistics = {
    'Is Purple': 4,
    'Is Also Purple': 3,
    'Is Yellow': 2,
    'Colour unknown': 1
  };

  var isPurple = {
    'Is Purple': true,
    'Is Also Purple': true,
    'Is Yellow': false,
    'Colour unknown': undefined
  };

  var mappings = {
    'true': 'purples',
    'false': 'notPurples',
    'else': 'hmm'
  };

  var result = trinaryCounter(statistics, isPurple, mappings);

  t.equal(result.purples, 2, 'counts 2 purples');
  t.equal(result.notPurples, 1, 'counts 1 not-purple');
  t.equal(result.hmm, 1, 'counts 1 unknown');

  t.end();
});
