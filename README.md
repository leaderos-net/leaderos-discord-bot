# LeaderOS Discord Bot
Allow players to link their accounts and roles, login with Discord account, and reply support tickets on your Discord server. It's completely Open Source!

## Learn More
🇺🇸 English: [https://help.leaderos.net/free-services/discord-bot](https://help.leaderos.net/free-services/discord-bot)

🇹🇷 Türkçe: [https://destek.leaderos.com.tr/uecretsiz-hizmetler/discord-bot](https://destek.leaderos.com.tr/uecretsiz-hizmetler/discord-bot)

## Requirements

- Node.js 16.11.0 or newer is required.
- Git (for using git clone command) (optional)

## Installation

1. Install [Node.js](https://nodejs.org/en/download/)

2. Install [Git](https://git-scm.com/downloads)

3. Clone the repository:

```
git clone https://github.com/leaderos-net/leaderos-discord-bot
```

4. Go to the repository folder:

```
cd leaderos-discord-bot
```

5. Install dependencies:

```
npm install
```

6. Configure the bot in `config.js`

7. Run the bot:

```
npm run start
```

## Installation Video

[![Installation Video](https://img.youtube.com/vi/9QX0Z6Q4Zq0/0.jpg)](https://www.youtube.com/watch?v=9QX0Z6Q4Zq0)

## Configuration

| Key        | Description                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| botToken   | Your bot's token. You can find it in the [Discord Developer Portal > Applications > Your Application > Bot](https://discord.com/developers/applications) |
| websiteUrl | Your website's URL. (https://yourdomain.com)                                                                                                             |
| apiKey     | Your Website API key. You can find it in the Dashboard > Settings > API                                                                                  |
| language   | The language of the bot. You can find the list of languages in the `languages` folder.                                                                   |
