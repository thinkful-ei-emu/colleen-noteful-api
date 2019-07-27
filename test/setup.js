/* eslint-disable strict */
const expect = require('chai').expect;
const supertest = require('supertest');
require('dotenv').config();

global.expect = expect;
global.supertest = supertest;