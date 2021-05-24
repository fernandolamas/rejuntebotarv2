import { init as initDiscord } from './discord/client.js';

const main = async () => {
  try {
    initDiscord();
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();