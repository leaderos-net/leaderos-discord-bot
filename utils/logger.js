module.exports = (message) => {
  if (!config.general.debug) return;

  console.log(`BOT: ${message}`);
};
