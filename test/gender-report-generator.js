#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');
var sinon = require('sinon');

var GenderReportGenerator = require('../src/gender-report-generator');

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() {}
};

function stubRetrieveAttribute() {
  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  retrieveAttributeStub.withArgs('Man', 'isMan').returns(Promise.resolve(true));
  retrieveAttributeStub.withArgs('Not-man', 'isMan').returns(Promise.resolve(false));

  return retrieveAttributeStub;
}

test('GenderReportGenerator generates a report when equal numbers of men and not-men have spoken', function(t) {
  var statistics = {
    'Man': 1,
    'Not-man': 1
  };

  var retrieveAttributeStub = stubRetrieveAttribute();

  var generator = new GenderReportGenerator(statistics, fakeUserRepository);

  generator.generate().then(function(report) {
    t.ok(report.indexOf('men sent 50%') > -1, 'reports 50% of messages were from men');
    t.ok(report.indexOf('not-men sent 50%') > -1, 'reports 50% of messages were from not-men');

    retrieveAttributeStub.restore();

    t.end();
  });
});

test('GenderReportGenerator generates a report with rounding', function(t) {
  var statistics = {
    'Man': 5,
    'Not-man': 1
  };

  var retrieveAttributeStub = stubRetrieveAttribute();

  var generator = new GenderReportGenerator(statistics, fakeUserRepository);

  generator.generate().then(function(report) {
    t.ok(report.indexOf('men sent 83%') > -1, 'reports 83% of messages were from men');
    t.ok(report.indexOf('not-men sent 17%') > -1, 'reports 17% of messages were from not-men');
    t.ok(report.indexOf('not sure') === -1, 'does not report on unknown');

    retrieveAttributeStub.restore();

    t.end();
  });
});

test('GenderReportGenerator handles unknown users', function(t) {
  var statistics = {
    'Man': 2,
    'Not-man': 1,
    'Unknown': 1
  };

  var retrieveAttributeStub = stubRetrieveAttribute();

  var generator = new GenderReportGenerator(statistics, fakeUserRepository);

  generator.generate().then(function(report) {
    t.ok(report.indexOf('men sent 50%') > -1, 'reports 50% of messages were from men');
    t.ok(report.indexOf('not-men sent 25%') > -1, 'reports 25% of messages were from not-men');
    t.ok(report.indexOf('not sure of the rest') > -1, 'reports that the rest were unknown');

    retrieveAttributeStub.restore();

    t.end();
  });
});
