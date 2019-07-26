/* eslint-disable strict */
const express = require('express');
const logger = require('../logger');
const path = require('path');
const noteRouter = express.Router();
const bodyParser = express.json();
const noteService = require('../note-service');
const xss = require('xss');

noteRouter
.route('/note');