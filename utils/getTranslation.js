const config = require('../config.js');

module.exports = () => {
  return require(`../languages/${config.general.language}.js`);
};
