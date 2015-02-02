#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');
var sinon = require('sinon');

var GenderStatisticsGenerator = require('../src/gender-statistics-generator');

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

function stubRetrieveAttribute() {
  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  retrieveAttributeStub.withArgs('Man', 'isMan').returns(Promise.resolve(true));
  retrieveAttributeStub.withArgs('Also-man', 'isMan').returns(Promise.resolve(true));
  retrieveAttributeStub.withArgs('Not-man', 'isMan').returns(Promise.resolve(false));

  return retrieveAttributeStub;
}

test('GenderStatisticsGenerator groups messages by gender', function(t) {
  var statistics = {
    'Man': 4,
    'Also-man': 3,
    'Not-man': 2,
    'Unknown': 1
  };

  var retrieveAttributeStub = stubRetrieveAttribute();

  var generator = new GenderStatisticsGenerator(statistics, fakeUserRepository);

  generator.generate().then(function(statistics) {
    t.equal(statistics.men, 7, 'counts 7 messages from men');
    t.equal(statistics.notMen, 2, 'counts 2 messages from not-men');
    t.equal(statistics.unknown, 1, 'counts 1 messages from unknown');

    retrieveAttributeStub.restore();

    t.end();
  });
});
