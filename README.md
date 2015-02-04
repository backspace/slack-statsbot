# slack-statsbot

This is a [Slack](https://slack.com) bot that monitors and reports on who is speaking in channels. It is an experiment by users of the [LGBTQ in Technology Slack](http://lgbtq.technology/).

It is alpha-quality as we work out what we need. For now, it monitors any channel it’s a member of and reports on who has been speaking by whether or not they are men.

To tell the bot you are a man, you send a direct message saying `I am a man`, or `I’m not a man` otherwise. You can check how your gender has been recorded by saying `info`. This interface is brittle but functional for now.

It’s not my tendency to categorise the world as men vs. not-men, but in the case of space-domination, it seems like the necessary dichotomy.

## Known limitations

* if the bot restarts, all gathered statistics are lost
* there’s no way to check on the current status; the bot will report after an hour has elapsed, and that’s it
* the report begins with a relative time that the statistics began accumulating, which for a channel that has its first message since the gathering began is the time the message comes in, meaning when the report is shared it will appear to represent less than an hour
* there’s *no* error handling!
* there are no automated tests for some functionality, such as:
  * the triggering of the hourly report
  * not printing a report when a channel has not had any messages
  * the message count logger
  * the `UserRepository`, a wrapper around Sequelize

## Requirements

The bot is for Slack, so you’ll need to set up a bot integration and have an API token ready. The user information is stored in a Postgres database.

## Running

You can run the bot thusly:

    DATABASE_URL=postgres://localhost/databasename \
    SLACK_TOKEN=your_token \
    npm start

## Testing

Because this is targeted to io.js and ES6, testing is very much in flux. You *should* be able to run the tests thusly:

    npm test

If that doesn’t work, this might:

    for I in test/*.js; do $I; done

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/backspace/slack-statsbot/tree/primary)

There seems to be no way to set the number of worker processes via the above Deploy button, so after the application has started, you should set the number of worker processes to 1. You can do this via the Heroku web interface at https://dashboard.heroku.com/apps/yourappname or by running `heroku ps:scale worker=1 -a yourappname`.

## Acknowledgements

Thanks to my mom for raising me with feminist values, even if they weren’t called that. Many friends and writers have helped me learn more about anti-oppression or social justice or whatever you like to call it.

The people in the Slack have been supportive as I worked on this, particularly @aredridel and @iarna. Thanks to @seldo for setting it up.
