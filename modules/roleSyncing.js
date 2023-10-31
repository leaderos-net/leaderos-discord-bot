const config = require('../config.js');
const api = require('../libs/axios.js');
const userData = require('../utils/userData.js');
const logger = require('../utils/logger.js');

module.exports = async (client) => {
  // Temp roles checker
  async function roleCheck() {
    if (client.guild === undefined) return;

    // Get all users from cache
    const users = Object.entries(await userData.getAll());
    users
      .filter(([discordUserID, user]) => user.tempRoles.length > 0) // Filter users which have temp roles
      .forEach(async ([discordUserID, user]) => {
        // Expired Roles
        const expiredRoles = user.tempRoles.filter(
          (role) => new Date(role.expiryDate) < new Date()
        );

        // Remove expired roles from member
        expiredRoles.forEach(async (role) => {
          const member = client.guild.members.cache.get(discordUserID);
          await member.roles.remove(role.roleID);

          // Debug
          logger(
            `Temp role (${role.roleID}) removed from ${member.user.username}`
          );
        });

        // Remove roles from cache
        user.tempRoles = user.tempRoles.filter(
          (tempRole) =>
            !expiredRoles.some(
              (expiredRole) => expiredRole.roleID === tempRole.roleID
            )
        );
        userData.set(discordUserID, user);
      });

    setTimeout(roleCheck, 1000 * config.roleSyncCachePeriod);
  }

  // Start role check loop
  roleCheck();

  // Handle member gets synced role
  client.on('guildMemberUpdate', async (oldMemberData, newMemberData) => {
    // If member gets a new role
    if (oldMemberData.roles.cache.size < newMemberData.roles.cache.size) {
      // If user is already synced, do nothing
      if (oldMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // If member doesn't get synced role, do nothing
      if (!newMemberData.roles.cache.has(client.settings.syncedRoleID)) return;

      // If user is synced on website and doesn't exist in cache, add user to cache
      const userDataCache = await userData.get(newMemberData.user.id);
      if (!userDataCache) {
        // Get user data
        const userInfo = await api.getUserInfo(newMemberData.user.id);

        // If user is not synced on website, do nothing
        if (!userInfo) return;

        // User website roles which have discord role id
        const userRoles = userInfo.roles.filter((role) => role.discordRoleID);

        // Create temp roles array
        const tempRoles = [];
        userRoles
          .filter(
            (role) =>
              role.expiryDate !== '1000-01-01 00:00:00' &&
              new Date(role.expiryDate) > new Date()
          ) // Filter roles which have expiry date and is not expired
          .forEach(
            (role) =>
              tempRoles.push({
                roleID: role.discordRoleID,
                expiryDate: role.expiryDate,
              }) // Push roles to temp roles array
          );

        // Add user to cache
        userData.set(newMemberData.user.id, {
          id: userInfo.id,
          tempRoles,
        });

        // Add website roles to member
        userRoles
          .filter(
            (role) =>
              role.expiryDate === '1000-01-01 00:00:00' ||
              new Date(role.expiryDate) > new Date()
          ) // Filter roles which have no expiry date or is not expired
          .forEach((role) => newMemberData.roles.add(role.discordRoleID));

        // Debug
        logger(`Roles synced for ${newMemberData.user.username}.`);

        if (client.settings.setNicknameStatus) {
          newMemberData.setNickname(userInfo.realname);

          // Debug
          logger(
            `Nickname changed to ${userInfo.realname} for ${newMemberData.user.username}`
          );
        }
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
      const userDataCache = await userData.get(newMemberData.user.id);

      // If user is not cached, do nothing
      if (!userDataCache) return;

      // Remove website roles from member
      const roles = await api.getRoles();
      roles
        .filter((role) => newMemberData.roles.cache.has(role.discordRoleID))
        .forEach((role) => newMemberData.roles.remove(role.discordRoleID));

      // Debug
      logger(`Synced roles removed from ${newMemberData.user.username}.`);

      // Remove user from cache
      userData.delete(newMemberData.user.id);

      if (client.settings.setNicknameStatus) {
        newMemberData.setNickname('');

        // Debug
        logger(`Nickname removed for ${newMemberData.user.username}`);
      }
    }
  });

  // Give synced role to member which is synced on website
  client.on('guildMemberAdd', async (member) => {
    // Get user data
    const userInfo = await api.getUserInfo(member.user.id);

    // If user is not synced on website, do nothing
    if (!userInfo) return;

    // If everything is ok, give synced role to member
    member.roles.add(client.settings.syncedRoleID);

    // Debug
    logger(`Synced role added to ${member.user.username}.`);
  });

  // Remove user from cache when member leaves
  client.on('guildMemberRemove', async (member) => {
    userData.delete(member.user.id);
  });
};
