const Discord = require("discord.js");
const libs = require("../libs/axios.js");
const texts = require("../utils/getLang.js")();

exports.run = async(client, interaction) => {
    var settings = await libs.getSettings()
    client.settings = settings

    interaction.reply({ content: texts.updated, ephemeral: true })
}

const cmd = new Discord.SlashCommandBuilder()
.setName("leaderos")
.setDescription("LeaderOS")
.setDMPermission(false)
.setDefaultMemberPermissions(8)
.addSubcommand(new Discord.SlashCommandSubcommandBuilder()
    .setName("update-settings")
    .setDescription("Updates client's settings.")
)

exports.data = cmd.toJSON()
