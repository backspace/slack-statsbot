#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');
var sinon = require('sinon');

var RepositoryAttributeExtractor = require('../src/repository-attribute-extractor');

var fakeUserRepository = {
  storeAttribute() {},
  retrieveAttribute() { return Promise.resolve(undefined); }
};

function stubRetrieveAttribute() {
  var retrieveAttributeStub = sinon.stub(fakeUserRepository, 'retrieveAttribute');

  retrieveAttributeStub.withArgs('Man', 'isMan').returns(Promise.resolve(true));
  retrieveAttributeStub.withArgs('Not-man', 'isMan').returns(Promise.resolve(false));

  return retrieveAttributeStub;
}

test('RepositoryAttributeExtractor extracts attributes in bulk', function(t) {
  var retrieveAttributeStub = stubRetrieveAttribute();

  var extractor = new RepositoryAttributeExtractor(fakeUserRepository, 'isMan', ['Man', 'Not-man', 'Unknown']);

  extractor.extract().then(function(values) {
    t.equal(values['Man'], true, 'returns that Man is a man');
    t.equal(values['Not-man'], false, 'returns that Not-man is not a man');
    t.equal(values['Unknown'], undefined, 'returns that Unknown’s isMan attribute is undefined');

    retrieveAttributeStub.restore();

    t.end();
  });
});
