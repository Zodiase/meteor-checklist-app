# Checklist App

[![Greenkeeper badge](https://badges.greenkeeper.io/Zodiase/meteor-checklist-app.svg)](https://greenkeeper.io/)

## Why?

The idea is, sometimes we need more than just a to-do list.

There are certain groups of tasks that need to be performed repeatedly (and likely in sequence) and the tasks in the groups don’t often change.

For example, a take-off checklist. (It’s not relavant to daily life but it’s a good example.)

Another example is a daily morning routine. One could put this in the calendar, but the difference of a checklist and a calendar schedule is a checklist can be started whenever needed. (Because I get out of the bed at different times every day.)

Let’s start simple and say the app should first support me doing my morning and evening routines.

## MVP Feature List

See the list at https://github.com/Zodiase/meteor-checklist-app/milestone/1

## Other Notes

### Run the app at some sub-directory, instead of root of domain.

Suppose we want the app to be running at `http://localhost:3000/my-checklist-app`.

- In `app/settings.json`, change `public.baseUrl` to `'my-checklist-app'`.
- When running the app, set `ROOT_URL` to `'http://localhost:3000/my-checklist-app'`.
