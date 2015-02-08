#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var RaceMessageCount = require('../../src/calculators/race-message-count');

test('RaceMessageCount groups messages by race', function(t) {
  var statistics = {
    'White': 4,
    'Also-white': 3,
    'Person-of-colour': 2,
    'Unknown': 1
  };

  var userIsPersonOfColour = {
    'White': false,
    'Also-white': false,
    'Person-of-colour': true,
    'Unknown': undefined
  };

  var generator = new RaceMessageCount(statistics, userIsPersonOfColour);
  statistics = generator.generate();

  t.equal(statistics.whitePeople, 7, 'counts 7 messages from white people');
  t.equal(statistics.peopleOfColour, 2, 'counts 2 messages from people of colour');
  t.equal(statistics.unknown, 1, 'counts 1 message from unknown');

  t.end();
});
