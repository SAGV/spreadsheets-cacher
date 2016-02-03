# Spreadsheets cacher

The app is a caching layer between Google Spreadsheets and anything which uses spreadsheets data as an input (like [tabletop.js](https://github.com/jsoma/tabletop))

Unfortunately, Google Spreadsheets API can sometimes be slow or irresponsible and it has a daily calls limit. So that solution solves all the described issues by caching all the calls for some time (which you can set in `.env`)

# How does it work

Generally, it can cache pretty much anything over the web but since I needed it only for Spreadsheets and [Tabletop.js](https://github.com/jsoma/tabletop), I'll show an example based on these services.

## Setting up the cacher

Clone the repo, run `npm install` and then `npm start`. That's it. The app is running on port 3000.

Also you can rename `.env.example` to `.env` and use custom configuration it. Here are the options:

- `PORT`, port on which the should start. Defaults to `3000`
- `ENDPOINT`, is the protocol and domain you'd like to query for your data (spreadsheet). Defaults to `https://spreadsheets.google.com`
- `UPDATE_TIMEOUT_MINUTES`, is how often the app will update all the cached files. The updates are going in background in an async way. Defaults to `60` minutes
- `REMOVE_TIMEOUT_MINUTES`, is expiration time for the data. If it was not requested in that period of time, it will be removed from the cache and won't get updated anymore. Defaults to `4320` minutes or 3 days
- `DB`, name of the database. If left blank, the datastore is automatically considered in-memory only which is fine when you don't have many things to cache. If you're running a project with many spreadsheets to cache, I would recommend to set a name. Defaults to `false` so it is in-memory
- `DEV`, sets the environment. Currently not used

## Setting up the Tabletop.js or anything else which uses the cacher
While [initializing Tabletop.js](https://github.com/jsoma/tabletop#tabletop-initialization) set `endpoint: <cacher_address:port>` e. g. like that:

```
Tabletop.init({
  key: <public_spreadsheet_url>,
  callback: result => { ... },
  endpoint: <cacher_address:port>
})
```
# Development
You can use `nodemon app.js` to start the app in dev mode. In that case, it will be automatically restarted when any change is made.

Use `npm test` to run tests. The tests have watchers so they will be automatically restarted when any change is made.

# Possible TODOs
- Implement Authorization headers so strangers won't be able to use your caching app
- Make better testing setup (update Jasmine version and cover request part)
- Add missing bits to make it work on Heroku
