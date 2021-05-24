let { init } = require('./discord/client.js');


const main = async () => {
  try {
    init();
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();