const attributeConfigurations = require('./src/attribute-configurations');
const questionForAttributeConfiguration = require('./src/message-buttons/question-for-attribute-configuration');

const UserRepository = require('./src/persistence/user-repository');
const db = require('./models');
const userRepository = new UserRepository(db.User);

const server = require('./src/message-buttons/server')({attributeConfigurations, questionForAttributeConfiguration, userRepository});

server.listen(process.env.PORT || 3000);
