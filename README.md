# slack-statsbot

This is a [Slack](https://slack.com) bot that monitors and reports on who is speaking in channels. It is an experiment by users of the [LGBTQ in Technology Slack](http://lgbtq.technology/).

It is alpha-quality as we work out what we need. For now, it monitors any channel it’s a member of and reports on who has been speaking by whether or not they are men.

To tell the bot you are a man, you send a direct message saying `true`, or `false` otherwise. You can check how your gender has been recorded by saying `info`. This interface is rudimentary and brutal and will be improved.

It’s not my tendency to categorise the world as men vs. not-men, but in the case of space-domination, it seems like the necessary dichotomy.

## Known limitations

* any direct message to the bot other than *exactly* `true` or `info` will mark you as not a man
* if the bot restarts, all gathered statistics are lost
* there’s no way to check on the current status; the bot will report after an hour has elapsed, and that’s it
* the report begins with a relative time that the statistics began accumulating, which for a channel that has its first message since the gathering began is the time the message comes in, meaning when the report is shared it will appear to represent less than an hour
* there’s *no* error handling!
* there are no automated tests for some functionality, such as:
  * the triggering of the hourly report
  * not printing a report when a channel has not had any messages
  * the message count logger
  * the `UserRepository`, a wrapper around Sequelize

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/backspace/slack-statsbot/tree/primary)

There seems to be no way to set the number of worker processes via the above Deploy button, so after the application has started, you should set the number of worker processes to 1. You can do this via the Heroku web interface at https://dashboard.heroku.com/apps/yourappname or by running `heroku ps:scale worker=1 -a yourappname`.
