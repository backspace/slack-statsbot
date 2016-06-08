#!/usr/bin/env node --use-strict

var test = require('tape');

var selectUnknowns = require('../src/select-unknowns');

// TODO Test overkill?!?!?!
// Is this even worth being separated out?

test('selectUnknowns returns an object whose keys are those which have an undefined value in the other object', function(t) {
  var source = {
    known: 'something',
    unknown: 'else',
    knownOnce: 'once',
    anotherKnown: 'not',
    anotherUnknown: 'yes',
    aNullUnknown: 'hey'
  };

  var firstFilter = {
    known: true,
    unknown: undefined,
    knownOnce: true,
    anotherKnown: false,
    aNullUnknown: null
  };

  var secondFilter = {
    known: true,
    unknown: undefined,
    knownOnce: undefined,
    anotherKnown: false,
    aNullUnknown: null
  };

  var result = selectUnknowns(source, [firstFilter, secondFilter]);

  t.equal(result.known, undefined, 'should not select a key whose filter value was true');
  t.equal(result.anotherKnown, undefined, 'should not select a key whose filter value was false');
  t.equal(result.unknown, 'else', 'should preserve a key whose filter value was explicitly set to undefined');
  t.equal(result.knownOnce, 'once', 'should preserve a key whose filter value was unknown at least once');
  t.equal(result.anotherUnknown, 'yes', 'should preserve a key whose filter value was implicitly undefined');
  t.equal(result.aNullUnknown, 'hey', 'should preserve a key whose filter value was null');

  t.end();
});
