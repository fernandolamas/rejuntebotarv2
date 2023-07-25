let { init } = require('./discord/client.js');
const express = require('express');
const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, printf } = format;
const app = express();
const port = 3000;
const fs = require('fs');
const util = require('util');
let d = new Date()
let str = `${d.getDay()}-${d.getMonth()}-${d.getFullYear()}`;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const logger = winston.createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `logs/Full-${str}.log` }),
  ],
})
const errorLogger = winston.createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
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