const Discord = require("discord.js");
const config = require("./config.js");
const client = new Discord.Client({ intents: [
    "DirectMessageTyping",
    "DirectMessages",
    "GuildBans",
    "GuildEmojisAndStickers",
    "GuildMembers",
    "GuildMessageTyping",
    "GuildMessages",
    "GuildPresences",
    "Guilds",
    "MessageContent"
]})
const fs = require('fs');
const request = require('request');
const libs = require("./libs/axios.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const texts = require("./utils/getLang.js")();

client.login(config.general.botToken) //Giriş yapma

libs.getSettings().then(data => {
    client.settings = data
}) //Ayarları yükleme


const commands = []
client.commands = new Discord.Collection();
const files = fs.readdirSync(__dirname + "/commands").filter(file => file.endsWith(".js"));
console.log("Loading " + files.length + " commands.")
for (const file of files) {
    const cmd = require("./commands/"+file)
    client.commands.set(cmd.data.name, cmd)
    commands.push(cmd.data)
} //Komutları yükleme

client.on("ready", async() => {
    console.log("BOT: Logged in as " + client.user.username)
    client.user.setStatus("idle")
    client.user.setActivity("MeteBhey")
    const rest = new Discord.REST({ version: '9' }).setToken(config.general.botToken)
    rest.put(Discord.Routes.applicationCommands(client.user.id), { body: commands }).then(() => {
        console.log("Commands loaded")
    })
    if(!(await db.get("userDatas"))) await db.set("userDatas", [])
})
client.on("interactionCreate", async(interaction) => {
    if(!interaction.isCommand()) return;
    let client = interaction.client;
    if(!interaction.channel) return;
    if(interaction.channel.type === "DM") return;
    let command = interaction.commandName
    let cmd;
    if(client.commands.has(command)) {
        cmd = client.commands.get(command);
    }
    if(cmd) {
        cmd.run(client, interaction)
    }
}) //Komut kullanıldığında açılışta yüklenen komutu bul ve çalıştır

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

client.on("guildMemberUpdate", async(oMember, nMember) => {
    if(oMember.roles.cache.size < nMember.roles.cache.size) {
        if(!nMember.roles.cache.has(client.settings.syncedRoleID)) return;
        if(oMember.roles.cache.has(client.settings.syncedRoleID)) return;
        var userInfo = await libs.getUserInfo(nMember.user.id)
        if(!(await db.get("userDatas")).find(d => d.discordUserID === nMember.user.id)) {
            await db.push("userDatas", {
                discordUserID: nMember.user.id,
                accountID: userInfo.id
            })

            for (let i = 0; i < userInfo.roles.length; i++) {
                if(userInfo.roles[i].discordRoleID) {
                    nMember.roles.add(userInfo.roles[i].discordRoleID)
                }
            }
        }
    }
})

client.on("guildMemberAdd", async(member) => {
    var datas = await db.get("userDatas")
    var userInfo = datas.find(b => b.discordUserID === member.user.id)
    if(!userInfo) {
        var ui = await libs.getUserInfo(member.user.id)
        if(!ui) return;
        await db.push("userDatas", {
            discordUserID: member.user.id,
            accountID: userInfo.id
        })
    }
    member.roles.add(client.settings.syncedRoleID)
})
