const axios = require('axios');
const config = require('../config.js');

// Create axios instance
const instance = axios.create({
  baseURL: config.general.wesiteUrl,
  headers: { 'X-API-KEY': config.general.apiKey },
});

// Send message to support ticket
module.exports.sendTicketMessage = async (
  ticketID,
  accountID,
  isStaff,
  message
) => {
  await instance.post(
    '/api/support/tickets/' + ticketID + '/messages',
    {
      userID: accountID,
      message: message,
      isAdmin: isStaff.toString(),
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

// Close the support ticket
module.exports.closeTicket = async (ticketID) => {
  await instance.post('/api/support/tickets/' + ticketID + '/close');
};

// Get settings
module.exports.getSettings = async () => {
  const { data } = await instance.get('/api/integrations/discord/settings');
  return data;
};

// Get user data
module.exports.getUserInfo = async (discordUserID) => {
  const { data } = await instance.get(
    '/api/integrations/discord/users/' + discordUserID
  );
  return data;
};
