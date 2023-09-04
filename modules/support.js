const libs = require("./libs/axios.js");
const texts = require("./utils/getLang.js")();

module.exports = async(client) => {
    const db = client.db;

    client.on("messageCreate", async(message) => {
        if(message.author.bot) return;
        if(!message.channel.name.startsWith("ticket")) return;
        if(message.channel.parent.id != client.settings.categoryID) return;
        var isStaff = false
        if(client.settings.staffRoleIDs.some(r => message.member.roles.cache.has(r))) isStaff = true
        var userData = (await db.get("userDatas")).find(data => data.discordUserID === message.author.id)
        if(!userData) {
            message.channel.send("<@"+message.author.id+"> "+texts.notSynced).then(msg => setTimeout(() => { msg.delete() }, 5000))
            return message.delete()
        }
    
        var ticketID = message.channel.name.replace("ticket-", "")
    
        libs.sendMessage(ticketID, userData.accountID, isStaff, message.content)
    })
    
    client.on("interactionCreate", async(interaction) => {
        if(!interaction.isButton()) return;
        if(interaction.customId != "tickets_closeBtn") return;
        if(interaction.channel.parent.id != client.settings.categoryID) return;
        await interaction.deferUpdate()
    
        var embed = new Discord.EmbedBuilder()
        .setDescription("Ticket closing...")
        .setColor("Blurple")
        await interaction.channel.send({ embeds: [embed] })
    
        var ticketID = interaction.channel.name.replace("ticket-", "")
        
        setTimeout(() => {
            interaction.channel.delete()
        }, 1000);
        libs.closeTicket(ticketID)
    })
}