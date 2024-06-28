const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    execute(message, client) {
        const prefix = client.config.clients.prefix;

        if (message.mentions.has(client.user) && message.content.trim() === `<@${client.user.id}>`) {
            message.channel.send(`Mon préfix est : \`${prefix}\``);
        }
    }
};
