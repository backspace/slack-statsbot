# slack-statsbot [![Build Status](https://travis-ci.org/backspace/slack-statsbot.svg)](https://travis-ci.org/backspace/slack-statsbot)

This is a [Slack](https://slack.com) bot that monitors and reports on who is speaking in channels. It is an experiment by users of the [LGBTQ in Technology Slack](http://lgbtq.technology/). [But why?](#but-why)

It is alpha-quality as we work out what we need. For now, it monitors any channel it’s a member of and reports on who has been speaking by whether or not they are men.

To tell the bot you are a man, you send a direct message saying `I am a man`, or `I’m not a man` otherwise. You can check how your gender has been recorded by saying `info`. This interface is brittle but functional for now.

It’s not my tendency to categorise the world as men vs. not-men, but in the case of space-domination, it seems like the necessary dichotomy.

## But why?

From [Seven Studies That Prove Mansplaining Exists](http://bitchmagazine.org/post/seven-studies-proving-mansplaining-exists):

> 1. Women get interrupted more than men.
> 2. Men interrupt women to assert power.
> 3. Men dominate conversations during professional meetings.
> 4. Men and boys dominate conversation in classrooms.
> 5. Patients are more likely to interrupt female doctors than male doctors.
> 6. Men get more space in print and online journalism.
> 7. On Twitter, men are retweeted more often than women.

Here’s an explanation from a Slack participant who is a man:

> I think the way to think about the bot is that it's a gentle reminder that […] men are speaking more in the larger group spaces. We should look at it both as an encouragement for not-men to speak up ("Your voices are wanted and respected here"), and for men to engage in conversation with not-men (as in - make sure you don't run rough-shod over conversation points brought up by not-men, which is shockingly easy to do).

I am a man myself, and recognise my own complicity in these patterns even as I work to fight them. I *try* to have the humility to listen when someone wants to bring something up with me, so please do. Men who are angry or upset about this should direct their inquiries to me and other men on the Slack, not others, who can choose to participate or not.

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
* software can only do so much to undermine patriarchy and white supremacy

## Requirements

This uses ES2015 features and runs on (at least) Node 4.2.0.

The bot is for Slack, so you’ll need to set up a bot integration and have an API token ready. The user information is stored in a Postgres database.

## Running

You can run the bot thusly:

    DATABASE_URL=postgres://localhost/databasename \
    SLACK_TOKEN=your_token \
    npm start

## Testing

You *should* be able to run the tests thusly:

    npm test

If that doesn’t work, this might:

    for I in test/*.js; do $I; done

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/backspace/slack-statsbot/tree/primary)

There seems to be no way to set the number of worker processes via the above Deploy button, so after the application has started, you should set the number of worker processes to 1. You can do this via the Heroku web interface at https://dashboard.heroku.com/apps/yourappname or by running `heroku ps:scale worker=1 -a yourappname`.

I tried adding a `postdeploy` script to the `app.json` Heroku deployment configuration but it fails on an error, so the application has been deployed, you should run the database migrations:

    heroku run -a yourappname sequelize --env production db:migrate

But maybe that doesn’t even work, either. Check out [the issue](https://github.com/backspace/slack-statsbot/issues/8) for details.

## Acknowledgements

Thanks to my mom for raising me with feminist values, even if they weren’t called that. Many friends and writers have helped me learn more about anti-oppression or social justice or whatever you like to call it.

The people in the Slack have been supportive as I worked on this, particularly @aredridel and @iarna. Thanks to @seldo for setting it up.
