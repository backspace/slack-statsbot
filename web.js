const attributeConfigurations = require('./src/attribute-configurations');
const questionForAttributeConfiguration = require('./src/message-buttons/question-for-attribute-configuration');

const server = require('./src/message-buttons/server')({attributeConfigurations, questionForAttributeConfiguration});

server.listen(process.env.PORT || 3000);
