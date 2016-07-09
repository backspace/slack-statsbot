const attributeConfigurations = require('./attribute-configurations');
const questionForAttributeConfiguration = require('src/message-buttons/question-for-attribute-configuration');

const server = require('./src/message-buttons/server')({attributeConfiguration, questionForAttributeConfiguration});

server.listen(process.env.PORT || 3000);
