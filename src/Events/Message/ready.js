const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    execute(client) {
        console.log(`Connécté : ${client.user.username}`);
        console.log(
            `Serveurs : ${client.guilds.cache.size}\n`
            + `Membres : ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\n`
            + `Client Id: ${client.user.id}\n`
            + `Invite: https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=0`
        );
    }
};
