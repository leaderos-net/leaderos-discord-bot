const Discord = require('discord.js');
const libs = require('../libs/axios.js');
const t = require('../utils/getTranslation.js')();

// Handle command
exports.run = async (client, interaction) => {
  const settings = await libs.getSettings();
  client.settings = settings;

  interaction.reply({
    content: t.updated,
    ephemeral: true,
  });
};

// Register command
const cmd = new Discord.SlashCommandBuilder()
  .setName('leaderos')
  .setDescription('LeaderOS')
  .setDMPermission(false)
  .setDefaultMemberPermissions(8)
  .addSubcommand(
    new Discord.SlashCommandSubcommandBuilder()
      .setName('update-settings')
      .setDescription(t.commands.leaderos.updateSettings.description)
  );

exports.data = cmd.toJSON();
