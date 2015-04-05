#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var UpdateParser = require('../src/update-parser');

test('UpdateParser accepts an attribute configuration and a string and returns which attribute value the string matches, if any', function(t) {
  var inputToResponse = {
    'I am a student': true,
    'I’m NOT a student': false,
    'something else': undefined
  };

  var attributeConfiguration = {
    name: 'studentness',
    values: [
      {
        value: true,
        matcherSets: [
          [{matches: 'student'}, {doesNotMatch: 'not'}]
        ]
      },
      {
        value: false,
        matcherSets: [
          [{matches: 'student'}, {matches: 'not'}]
        ]
      }
    ]
  };

  Object.keys(inputToResponse).forEach(function(input) {
    var parser = new UpdateParser(attributeConfiguration, input);
    var response = parser.parse();

    t.equal(response, inputToResponse[input], `${input} should parse to ${inputToResponse[input]} and was ${response}`);
  });

  t.end();
});
