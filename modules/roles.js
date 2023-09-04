module.exports = async(client) => {
    const db = client.db;

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
}