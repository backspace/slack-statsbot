class RepositoryAttributeExtractor {
  constructor(repository, attributeName, ids) {
    this.repository = repository;
    this.attributeName = attributeName;
    this.ids = ids;
  }

  extract() {
    var retrievalPromises = this.ids.map(function(id) {
      return this.repository.retrieveAttribute(id, this.attributeName);
    }.bind(this));

    // TODO would be nice to have RSVP.hash here
    return Promise.all(retrievalPromises).then(function(attributeValues) {
      var idToValue = this.ids.reduce(function(idToValue, id, index) {
        idToValue[id] = attributeValues[index];

        return idToValue;
      }.bind(this), {});

      return idToValue;
    }.bind(this));
  }
}

module.exports = RepositoryAttributeExtractor;
