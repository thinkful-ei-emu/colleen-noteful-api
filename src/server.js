/* eslint-disable strict */
const app = require('./app');
const {PORT, DB_URL} = require('./config');
const knex = require('knex');
console.log(DB_URL)
const db = knex({
  client: 'pg',
  connection: DB_URL
});

app.set('db', db);
app.listen(PORT, ()=>console.log(`Running on port ${PORT}`))