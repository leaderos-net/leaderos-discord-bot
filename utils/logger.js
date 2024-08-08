const config = require('../config.js');

module.exports = (message) => {
  if (
    !config.debug ||
    config.debug === undefined ||
    config.debug === false ||
    config.debug === 'false'
  ) {
    return false;
  }

  const date = new Date();
  console.log(`${date} [BOT]: ${message}`);
};
