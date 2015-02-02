#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var GenderParticipantCountReportGenerator = require('../src/gender-participant-count-report-generator');

test('GenderParticipantCountReportGenerator reports on the gender of participants', function(t) {
  var participantGenderCount = {
    men: 1,
    notMen: 1,
    unknown: 1
  };

  var report = new GenderParticipantCountReportGenerator(participantGenderCount).generate();

  t.ok(report.indexOf('33% of participants were men') > -1 , 'reports that 33% of participants were men');
  t.ok(report.indexOf('33% were not-men') > -1, 'reports that 33% of participants were not-men');
  t.ok(report.indexOf('33% were unknown') > -1, 'reports that 33% of participants were unknown');

  t.end();
});

test('GenderParticipantCountReportGenerator does not mention unknowns when none have spoken', function(t) {
  var participantGenderCount = {
    men: 1,
    notMen: 1,
    unknown: 0
  };

  var report = new GenderParticipantCountReportGenerator(participantGenderCount).generate();

  t.ok(report.indexOf('50% of participants were men') > -1 , 'reports that 50% of participants were men');
  t.ok(report.indexOf('50% were not-men') > -1, 'reports that 50% of participants were not-men');
  t.ok(report.indexOf('unknown') == -1, 'does not mention unknowns');

  t.end();
});
