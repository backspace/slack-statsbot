# slack-statsbot

This is a [Slack](https://slack.com) bot that monitors and reports on who is speaking in channels. It is an experiment by users of the [LGBTQ in Technology Slack](http://lgbtq.technology/).

It is alpha-quality as we work out what we need. For now, it monitors any channel it’s a member of and reports on who has been speaking by whether or not they are men.

To tell the bot you are a man, you send a direct message saying `true`, or `false` otherwise. You can check how your gender has been recorded by saying `info`. This interface is rudimentary and brutal and will be improved.

It’s not my tendency to categorise the world as men vs. not-men, but in the case of space-domination, it seems like the necessary dichotomy.

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/backspace/slack-statsbot/tree/primary)

There seems to be no way to set the number of worker processes via the above Deploy button, so after the application has started, you should set the number of worker processes to 1. You can do this via the Heroku web interface at https://dashboard.heroku.com/apps/yourappname or by running `heroku ps:scale worker=1 -a yourappname`.
