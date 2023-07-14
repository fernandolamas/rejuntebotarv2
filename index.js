let { init } = require('./discord/client.js');
const express = require('express');
const winston = require('winston');
const app = express();
const port = 3000;
const fs = require('fs');
const util = require('util');
let d = new Date()
let str = `${d.getDay()}-${d.getMonth()}-${d.getFullYear()}-${d.getHours()}-${d.getMinutes()}`;
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ silent: process.env.NODE_ENV == "test" }),
    new winston.transports.File({ filename: `logs/Full-${str}.log` }),
  ],
})
const errorLogger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `logs/Error-${str}.log` }),
  ],
})
console.log = (...args) => {logger.log('info', ...args)}
console.error = (...args) => {errorLogger.log('error', ...args)}
const main = async () => {
  try {
    init(app, port);
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();