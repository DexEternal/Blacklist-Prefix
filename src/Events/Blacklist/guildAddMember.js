const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const blacklistKey = 'blacklist';
        const blacklist = await db.get(blacklistKey) || [];

        if (blacklist.includes(member.id)) {
            member.ban({ reason: 'Blacklist' }).catch(console.error);
        }
    }
};
