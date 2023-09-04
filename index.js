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
const libs = require("./libs/axios.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

client.login(config.general.botToken) //Giriş yapma
client.db = db

libs.getSettings().then(data => {
    client.settings = data
}) //Ayarları yükleme

require("./modules/support.js")(client);
require("./modules/roles.js")(client);

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