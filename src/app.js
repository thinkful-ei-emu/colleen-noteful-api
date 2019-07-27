/* eslint-disable strict */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const noteRouter = require('./note/note.router.js');
const folderRouter = require('./folder/folder.router.js');
const { NODE_ENV } = require('./config');
const logger = require('./logger.js');
const app = express();
//if production, want morgan to change based on prod vs dev
const morganOption = (NODE_ENV === 'production' 
  ? 'common' 
  : 'tiny');
 
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production') {
    response = { error : { message: 'server error'}};
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  logger.error('Server error');
  res.status(500).json(response);
});
app.use('/api', noteRouter);
app.use('/api', folderRouter);
app.get('/', (req,res)=>{
  res.send('hello, world!');
});

module.exports = app;