const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  botToken: process.env.DISCORD_BOT_TOKEN ?? 'YOUR_BOT_TOKEN',
  websiteUrl: process.env.WEBSITE_URL ?? 'https://yourwebsite.com/',
  apiKey: process.env.API_KEY ?? 'YOUR_API_KEY',
  language: process.env.LANGUAGE ?? 'en',
  debug: process.env.DEBUG ?? true,
  roleSyncCachePeriod: process.env.ROLE_SYNC_CACHE_PERIOD ?? 60,
};
