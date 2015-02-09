#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var RaceUpdateParser = require('../src/race-update-parser');

test('RaceUpdateParser parses whether or not someone is a person of colour', function(t) {
  var inputToResponse = {
    'i am a Person of Colour': true,
    'person of color': true,
    'i am not a person of color': false,
    'i am white': false,
    'i am not white': true,
    'anything': undefined
  };

  Object.keys(inputToResponse).forEach(function(input) {
    var parser = new RaceUpdateParser(input);
    var response = parser.parseIsPersonOfColour();

    t.equal(response, inputToResponse[input], `${input} should represent isPersonOfColour ${inputToResponse[input]} but response was ${response}`);
  });

  t.end();
});
