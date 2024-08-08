const config = require('../config.js');

module.exports = (message) => {
  if (!config.debug) return;

  const date = new Date();
  console.log(`${date} [BOT]: ${message}`);
};
