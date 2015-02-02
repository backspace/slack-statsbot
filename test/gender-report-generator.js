#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var GenderReportGenerator = require('../src/gender-report-generator');

test('GenderReportGenerator generates a report when equal numbers of men and not-men have spoken', function(t) {
  var statistics = {
    men: 1,
    notMen: 1,
    unknown: 0
  };

  var report = new GenderReportGenerator(statistics).generate();

  t.ok(report.indexOf('men sent 50%') > -1, 'reports 50% of messages were from men');
  t.ok(report.indexOf('not-men sent 50%') > -1, 'reports 50% of messages were from not-men');

  t.end();
});

test('GenderReportGenerator generates a report with rounding', function(t) {
  var statistics = {
    men: 5,
    notMen: 1,
    unknown: 0
  };

  var report = new GenderReportGenerator(statistics).generate();

  t.ok(report.indexOf('men sent 83%') > -1, 'reports 83% of messages were from men');
  t.ok(report.indexOf('not-men sent 17%') > -1, 'reports 17% of messages were from not-men');
  t.ok(report.indexOf('not sure') === -1, 'does not report on unknown');

  t.end();
});

test('GenderReportGenerator handles unknown users', function(t) {
  var statistics = {
    men: 2,
    notMen: 1,
    unknown: 1
  };

  var report = new GenderReportGenerator(statistics).generate();

  t.ok(report.indexOf('men sent 50%') > -1, 'reports 50% of messages were from men');
  t.ok(report.indexOf('not-men sent 25%') > -1, 'reports 25% of messages were from not-men');
  t.ok(report.indexOf('not sure of the other 25%') > -1, 'reports that the other 25% were unknown');

  t.end();
});
