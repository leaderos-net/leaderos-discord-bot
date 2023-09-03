const config = require("../config.js");

module.exports = () => {
    var file = require(`../languages/${config.general.language}.js`);
    return file;
}
