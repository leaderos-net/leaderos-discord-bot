const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports.getAll = () => {
  return db.get(`users`);
};
module.exports.get = (discordUserID) => {
  return db.get(`users.${discordUserID}`);
};
module.exports.add = (discordUserID, data) => {
  return db.set(`users.${discordUserID}`, data);
};
module.exports.delete = (discordUserID) => {
  return db.delete(`users.${discordUserID}`);
};
