#!/usr/bin/env node --use-strict

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

test('trinaryCounter can count with arbitrary string keys', function(t) {
  var statistics = {
    'Cat': 10,
    'Dog': 9,
    'Bird': 8,
    'Corn': 7,
    'Broccoli': 6,
    'Carrot': 5,
    'Ruby': 4,
    'Garnet': 3,
    'Pearl': 2,
    'Steven': 1
  };

  var variety = {
    'Cat': 'animal',
    'Dog': 'animal',
    'Bird': 'animal',
    'Corn': 'vegetable',
    'Broccoli': 'vegetable',
    'Carrot': 'vegetable',
    'Ruby': 'mineral',
    'Garnet': 'mineral',
    'Pearl': 'mineral',
    'Steven': undefined
  };

  var mappings = {
    'animal': 'animals',
    'vegetable': 'vegetables',
    'mineral': 'minerals',
    'else': 'unknown'
  };

  var result = trinaryCounter(statistics, variety, mappings);

  t.equal(result.animals, 3, 'counts 3 animals');
  t.equal(result.vegetables, 3, 'counts 3 vegetables');
  t.equal(result.minerals, 3, 'counts 3 minerals');
  t.equal(result.unknown, 1, 'counts 1 unknown');

  t.end();
});
