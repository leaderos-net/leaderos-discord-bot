const api = require('../libs/axios.js');
const userData = require('../utils/userData.js');

module.exports = async (client) => {
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
      const userDataCache = await userData.get(newMemberData.user.id);
      if (!userDataCache) {
        // Add user to cache
        userData.add(newMemberData.user.id, {
          id: userInfo.id,
        });

        // Add website roles to member
        userInfo.roles
          .filter((role) => role.discordRoleID)
          .forEach((role) => newMemberData.roles.add(role.discordRoleID));
      }
    }
  });

  // Remove synced role when member unlink account
  client.on('guildMemberUpdate', async (oldMemberData, newMemberData) => {
    // If removes a role from member
    if (oldMemberData.roles.cache.size > newMemberData.roles.cache.size) {
      // If user has not synced role before removing role, do nothing
      if (!oldMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // If user has synced role after removing role, do nothing
      if (newMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // Get user data
      const userDataCache = await userData.get(member.user.id);

      // Remove website roles from member
      const userRoles = await api.getUserRoles(userDataCache.id);
      userRoles
        .filter((role) => role.discordRoleID)
        .forEach((role) => newMemberData.roles.remove(role.discordRoleID));

      // Remove user from cache
      userData.delete(member.user.id);
    }
  });

  // Give synced role to member which is synced on website
  client.on('guildMemberAdd', async (member) => {
    // Check if user is synced in cache
    const userDataCache = await userData.get(member.user.id);

    // Check if user is synced on website
    if (!userDataCache) {
      const userInfo = await api.getUserInfo(member.user.id);

      // If user is not synced on website, do nothing
      if (!userInfo) return;

      // If user is synced on website, add user to cache
      userData.add(member.user.id, {
        id: userInfo.id,
      });
    }

    // If everything is ok, give synced role to member
    member.roles.add(client.settings.syncedRoleID);
  });

  // Remove user from cache when member leaves
  client.on('guildMemberRemove', async (member) => {
    userData.delete(member.user.id);
  });
};
