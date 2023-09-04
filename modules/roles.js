const api = require('../libs/axios.js');

module.exports = async (client) => {
  const db = client.db;

  // Handle member gets synced role
  client.on('guildMemberUpdate', async (oldMemberData, newMemberData) => {
    // If member gets a new role
    if (oldMemberData.roles.cache.size < newMemberData.roles.cache.size) {
      // If user is already synced, do nothing
      if (oldMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // If member doesn't get synced role, do nothing
      if (!newMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // Get user data
      const userInfo = await api.getUserInfo(newMemberData.user.id);

      // If user is not synced on website, do nothing
      if (!userInfo) return;

      // If user is synced on website and doesn't exist in cache, add user to cache
      if (
        !(await db.get('userDatas')).find(
          (userCache) => userCache.discordUserID === newMemberData.user.id
        )
      ) {
        // Add user to cache
        await db.push('userDatas', {
          discordUserID: newMemberData.user.id,
          accountID: userInfo.id,
        });

        // Add roles to member
        userInfo.roles
          .filter((role) => role.discordRoleID)
          .forEach((role) => newMemberData.roles.add(role.discordRoleID));
      }
    }
  });

  // Give synced role to member which is synced on website
  client.on('guildMemberAdd', async (member) => {
    // Check if user is synced in cache
    const userCaches = await db.get('userDatas');
    const userInfoCache = userCaches.find(
      (userCache) => userCache.discordUserID === member.user.id
    );

    // Check if user is synced on website
    if (!userInfoCache) {
      const userInfo = await api.getUserInfo(member.user.id);

      // If user is not synced on website, do nothing
      if (!userInfo) return;

      // If user is synced on website, add user to cache
      await db.push('userDatas', {
        discordUserID: member.user.id,
        accountID: userInfo.id,
      });
    }

    // If everything is ok, give synced role to member
    member.roles.add(client.settings.syncedRoleID);
  });
};
