
module.exports = function questionForAttributeConfiguration(attributeConfiguration) {
  return [{
    title: attributeConfiguration.interviewQuestion,
    callback_id: attributeConfiguration.name,
    color: '#ccc',
    attachment_type: 'default',
    actions: attributeConfiguration.values.map(value => {
      return {
        name: attributeConfiguration.name,
        text: value.texts.interviewAnswer,
        type: 'button',
        value: value.value || 'decline'
      };
    })
  }];
}
