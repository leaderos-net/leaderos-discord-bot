const Discord = require('discord.js');
const config = require('./config.js');
const client = new Discord.Client({
  intents: [
    'DirectMessageTyping',
    'DirectMessages',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildMembers',
    'GuildMessageTyping',
    'GuildMessages',
    'GuildPresences',
    'Guilds',
    'MessageContent',
  ],
});
const fs = require('fs');
const libs = require('./libs/axios.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

// Access to client
client.login(config.general.botToken);
client.db = db;

// Load settings
libs.getSettings().then((data) => {
  client.settings = data;
});

// Load modules
const modules = ['support', 'roles'];
console.log('Loading ' + modules.length + ' modules.');
modules.map((module) => {
  require(`./modules/${module}.js`)(client);
});
console.log('Modules loaded.');

// Load Commands
const commands = [];
client.commands = new Discord.Collection();

const files = fs
  .readdirSync(__dirname + '/commands')
  .filter((file) => file.endsWith('.js'));
console.log('Loading ' + files.length + ' commands.');

files.map((file) => {
  const cmd = require('./commands/' + file);
  client.commands.set(cmd.data.name, cmd);
  commands.push(cmd.data);
});

// Initialize bot
client.on('ready', async () => {
  console.log('BOT: Logged in as ' + client.user.username);

  client.user.setStatus('idle');
  client.user.setActivity('LEADEROS');

  const rest = new Discord.REST({ version: '9' }).setToken(
    config.general.botToken
  );
  rest
    .put(Discord.Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => {
      console.log('Commands loaded.');
    });

  // Initialize database
  if (!(await db.get('userDatas'))) await db.set('userDatas', []);
});

// Command Handler
client.on('interactionCreate', async (interaction) => {
  if (
    !interaction.isCommand() ||
    !interaction.channel ||
    interaction.channel.type === 'DM'
  )
    return;

  const command = interaction.commandName;
  const cmd = client.commands.get(command);

  if (cmd) {
    cmd.run(client, interaction);
  }
});
