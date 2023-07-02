let { init } = require('./discord/client.js');
const express = require('express');
const app = express();
const port = 3000;



const main = async () => {
  try {
    init(app, port);
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();