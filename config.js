const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  botToken: process.env.DISCORD_BOT_TOKEN ?? 'MTE1MTIyNjY4Mjg4NDIzMTIxOQ.Guimz7.7zWuM9tRVJNc_cOPBz7hv6vtBQrMEX1Xm-jFlY',
  websiteUrl: process.env.WEBSITE_URL ?? 'https://yourwebsite.com/',
  apiKey: process.env.API_KEY ?? 'YOUR_API_KEY',
  language: process.env.LANGUAGE ?? 'en',
  debug: process.env.DEBUG ?? true,
  roleSyncCachePeriod: process.env.ROLE_SYNC_CACHE_PERIOD ?? 60,
};
