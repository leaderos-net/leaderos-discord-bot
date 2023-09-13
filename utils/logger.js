const config = require('../config.js');

module.exports = (message) => {
  if (!config.debug) return;

  console.log(`BOT: ${message}`);
};
