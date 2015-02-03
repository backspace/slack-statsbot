#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var GenderUpdateParser = require('../src/gender-update-parser');

test('GenderUpdateParser parses whether or not someone is a man', function(t) {
  var inputToResponse = {
    'true': true,
    'false': false,
    'anything': undefined
  };

  Object.keys(inputToResponse).forEach(function(input) {
    var parser = new GenderUpdateParser(input);
    var response = parser.parseIsMan();

    t.equal(response, inputToResponse[input], `${input} should represent isMan ${inputToResponse[input]} but response was ${response}`);
  });

  t.end();
});
