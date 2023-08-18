let { init } = require('./discord/client.js');
const winston = require('winston');
const { format } = require('winston');
const { combine, printf } = format;



let date = new Date()
var options = { timeZone: 'America/Argentina/Buenos_Aires', hour12: false };
var argentinaLocalTime = date.toLocaleString('es-AR', options);
let d = new Date(argentinaLocalTime);
let str = `${d.getDay()}-${d.getMonth()}-${d.getFullYear()}`;
const myFormat = printf(({ level, message }) => {
  return `${d.toLocaleTimeString()} ${level}: ${message}`;
});
const logger = winston.createLogger({
  format: combine(
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `logs/Full-${str}.log` }),
  ],
})
const errorLogger = winston.createLogger({
  format: combine(
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
    init();
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();