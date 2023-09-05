const Discord = require('discord.js');
const api = require('../libs/axios.js');
const getTicketId = require('../utils/getTicketId.js');
const userData = require('../utils/userData.js');
const t = require('../utils/getTranslation.js')();

module.exports = async (client) => {
  const db = client.db;

  // Handle on send message to ticket channel
  client.on('messageCreate', async (message) => {
    // Check if message is sent by bot
    if (message.author.bot) return;

    // Check if message is sent in ticket channel
    if (!message.channel.name.startsWith('ticket')) return;

    // Check if message is sent in support category
    if (message.channel.parent.id != client.settings.ticketCategoryID) return;

    // Check if message is sent by staff
    const isStaff = client.settings.ticketStaffRoleIDs.some((staffRoleID) =>
      message.member.roles.cache.has(staffRoleID)
    );

    // Get user data from cache
    const userDataCache = await userData.get(message.author.id);

    // If user is not synced, do nothing and delete message
    if (!userDataCache) {
      message.channel
        .send('<@' + message.author.id + '> ' + t.notSynced)
        .then((msg) =>
          setTimeout(() => {
            msg.delete();
          }, 5000)
        );
      return message.delete();
    }

    // Get ticket ID from channel name
    const ticketID = getTicketId(message.channel.name);

    // Send message to ticket
    api.sendTicketMessage(ticketID, userDataCache.id, isStaff, message.content);
  });

  // Handle on click to close ticket button
  client.on('interactionCreate', async (interaction) => {
    // Check if interaction is button
    if (!interaction.isButton()) return;

    // Check if button is close button
    if (interaction.customId != 'tickets_closeBtn') return;

    // Check if button is clicked in ticket category
    if (interaction.channel.parent.id != client.settings.ticketCategoryID)
      return;

    // Check if clicked by staff
    const isStaff = client.settings.ticketStaffRoleIDs.some((staffRoleID) =>
      interaction.member.roles.cache.has(staffRoleID)
    );
    if (!isStaff) {
      const noPermissionEmbed = new Discord.EmbedBuilder()
        .setDescription(t.noPermission)
        .setColor('Red');
      await interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });

      return;
    }

    await interaction.deferUpdate();

    // Send closing embed message
    const embed = new Discord.EmbedBuilder()
      .setDescription(t.ticketClosing)
      .setColor('Orange');
    await interaction.channel.send({ embeds: [embed] });

    // Get ticket ID from channel name
    const ticketID = getTicketId(interaction.channel.name);

    // Delete channel
    setTimeout(() => {
      interaction.channel.delete();
    }, 1000);

    // Close ticket
    api.closeTicket(ticketID);
  });
};
