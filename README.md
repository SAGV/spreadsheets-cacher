# Spreadsheets cacher

The app is a caching layer between Google Spreadsheets and anything which uses spreadsheets data as an input (like [tabletop.js](https://github.com/jsoma/tabletop))

Unfortunately, Google Spreadsheets API can sometimes be slow or irresponsible and it has a daily calls limit. So that solution solves all the described issues by caching all the calls for some time (which you can set in `.env`)

# How does it work

Generally, it can cache pretty much anything over the web but since I needed it only for Spreadsheets and [Tabletop.js](https://github.com/jsoma/tabletop), I'll show an example based on these services.

## Setting up the Tabletop.js or anything else which uses the cacher
While [initializing Tabletop.js](https://github.com/jsoma/tabletop#tabletop-initialization) set `endpoint: <cacher_address:port>` e. g. like that:

```
Tabletop.init({
  key: <public_spreadsheet_url>,
  callback: result => { ... },
  endpoint: <cacher_address:port>
})
```

## Setting up the cacher (on local machine)

Clone the repo, run `npm install` and then `npm start`. That's it. The app is running on port 3000.

Also you can rename `.env.example` to `.env` and use custom configuration it. Here are the options:

- `PORT`, port on which the should start. Defaults to `3000`
- `ENDPOINT`, is the protocol and domain you'd like to query for your data (spreadsheet). Defaults to `https://spreadsheets.google.com`
- `UPDATE_TIMEOUT_MINUTES`, is how often the app will update all the cached files. The updates are going in background in an async way. Defaults to `60` minutes
- `REMOVE_TIMEOUT_MINUTES`, is expiration time for the data. If it was not requested in that period of time, it will be removed from the cache and won't get updated anymore. Defaults to `4320` minutes or 3 days
- `DB`, name of the database. If left blank, the datastore is automatically considered in-memory only which is fine when you don't have many things to cache. If you're running a project with many spreadsheets to cache, I would recommend to set a name. Defaults to `false` so it is in-memory
- `DEV`, sets the environment. Currently not used

## Setting up the cacher (on production)

### On Heroku

1. [Get a Heroku account](https://devcenter.heroku.com/articles/quickstart) and install their [awesome toolbelt](https://toolbelt.heroku.com)
2. Clone this repo and push it up to an Heroku instance or (Or use their dashboard to make an app, fork it and connect it to your fork in heroku dashboard)

```
git clone git@github.com:goabout/spreadsheets-cacher.git
cd spreadsheets-cacher
heroku create
git push heroku master
```

3. Set up env variables if needed (see the section above). In case of heroku, you don't need to edit `.env`, just set variables with `config:set` (see that [guide](https://devcenter.heroku.com/articles/nodejs-support#customizing-the-build-process))

4. Check you machine and try to load some spreadsheets. For example, with that test one:

```
<your_machine_address>/feeds/list/105qaS81D-gJwDPLAms0xo9ob2wIdmCBpQhD3sRyYn4k/od6/public/values?alt=json
```

If the answer is not a error, the machine works fine.
**Note: It was only checked with Tabletop.js generated links**

### On docker
1. Make sure you're familiar with [Docker](https://www.docker.com/) and it is installed on your machine
```
docker build .
docker run -p <your_preferred_port>:3000 -d <id>
```


# Development
You can use `nodemon app.js` to start the app in dev mode. In that case, it will be automatically restarted when any change is made.

Use `npm test` to run tests. The tests have watchers so they will be automatically restarted when any change is made.

# Possible TODOs
- Implement Authorization headers so strangers won't be able to use your caching app
- Make better testing setup (update Jasmine version and cover request part)
- Add missing bits to make it work on Heroku
— Implement GZIP, for example, with that [SO answer](http://stackoverflow.com/questions/10207762/how-to-use-request-or-http-module-to-read-gzip-page-into-a-string/10603029#10603029)

# Credits

The app was coded by [Artem Golovin](https://www.linkedin.com/in/artemgolovin) and specially for [GoAbout](https://goabout.com/) needs.
