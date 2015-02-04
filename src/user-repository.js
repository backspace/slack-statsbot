// TODO tests lol?

class UserRepository {
  constructor(sequelize) {
    this.sequelize = sequelize;

    var Sequelize = sequelize.Sequelize;

    this.User = sequelize.define('User', {
      isMan: Sequelize.BOOLEAN,
      hasBeenQueried: Sequelize.BOOLEAN,
      slackID: Sequelize.STRING
    });

    sequelize.sync();
  }

  storeAttribute(slackID, name, value) {
    return this.User.findOrCreate({where: {slackID: slackID}}).spread(function(user) {
      user[name] = value;

      return user.save();
    });
  }

  retrieveAttribute(slackID, name) {
    return this.User.find({where: {slackID: slackID}}).then(function(user) {
      if (user) {
        return user[name];
      } else {
        return undefined;
      }
    });
  }
}

module.exports = UserRepository;
