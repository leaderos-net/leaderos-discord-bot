const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('userdata.json');
const db = low(adapter);

module.exports.init = () => {
  db.defaults({ users: {} }).write();
};

module.exports.getAll = () => {
  return db.get(`users`).value();
};
module.exports.get = (discordUserID) => {
  return db.get(`users.${discordUserID}`).value();
};
module.exports.set = (discordUserID, data) => {
  return db.set(`users.${discordUserID}`, data).write();
};
module.exports.delete = (discordUserID) => {
  return db.unset(`users.${discordUserID}`).write();
};
