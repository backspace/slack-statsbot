const find = require('lodash.find');

/**
 * The attribute configurations used to contain an unknownValue property that
 * contained the texts for when an attribute value was unknown. Now that
 * people can set their attribute value to unknown, the value definition
 * is no different than the various known values. This restores the unknownValue
 * property until the code that depends on it can be removed.
 */

function deriveUnknownValue(attributeConfiguration) {
  const unknownValue = find(attributeConfiguration.values, valueConfiguration => valueConfiguration.value === null);
  attributeConfiguration.unknownValue = {
    texts: unknownValue.texts
  };

  return attributeConfiguration;
}

module.exports = [
  deriveUnknownValue(require('../attributes/pocness.json')),
  deriveUnknownValue(require('../attributes/manness.json'))
];
