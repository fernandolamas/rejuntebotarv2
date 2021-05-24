import { init as initDiscord } from './discord/client';
import { init as initState } from './state/state';

const main = async () => {
  try {
    initDiscord();
    await initState();
  } catch (error) {
    console.error(`Aborting: ${error}`);
    process.exit(0);
  }
};

main();