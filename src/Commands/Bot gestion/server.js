const { EmbedBuilder, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'server',
    description: "Fournit des informations sur le serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';

    let owners = await db.get(ownersKey) || [];
    let buyers = await db.get(buyersKey) || [];

    if (!Array.isArray(owners)) {
        owners = [];
    }

    if (!Array.isArray(buyers)) {
        buyers = [];
    }

    if (!owners.includes(userId) && !buyers.includes(userId) && userId !== buyerId) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    if (!args.length) {
        return;
    }

    const guild = message.guild;
    const action = args[0].toLowerCase();

    let embed = new EmbedBuilder()
        .setTitle(guild.name)
        .setColor(client.config.clients.embedColor);

    if (action === 'pic') {
        embed.setImage(guild.iconURL({ dynamic: true, size: 512 }));
        return message.channel.send({ embeds: [embed] });
    }

    if (action === 'banner' || action === 'banniere' || action === 'bannière') {
        if (!guild.bannerURL()) {
            return message.channel.send("Ce serveur n'a pas de bannière.");
        }
        embed.setImage(guild.bannerURL({ size: 512 }));
        return message.channel.send({ embeds: [embed] });
    }

    if (action === 'info') {
        const totalMembers = guild.memberCount;
        const totalBots = guild.members.cache.filter(member => member.user.bot).size;
        const totalHumans = totalMembers - totalBots;
        const onlineMembers = guild.members.cache.filter(member => member.presence && member.presence.status !== 'offline').size;
        const voiceMembers = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).map(channel => channel.members.size).reduce((a, b) => a + b, 0);
        const totalBoosts = guild.premiumSubscriptionCount;
        const totalRoles = guild.roles.cache.size;
        const totalChannels = guild.channels.cache.size;
        const totalEmojis = guild.emojis.cache.size;
        const vanityURLCode = guild.vanityURLCode || "Aucune URL";
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

        embed
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setImage(guild.bannerURL({ size: 512 }))
            .addFields(
                { name: '**ID**', value: guild.id, inline: true },
                { name: '**Nombre de membres**', value: totalMembers.toString(), inline: true },
                { name: '**Nombre de membres en ligne**', value: onlineMembers.toString(), inline: true },
                { name: "**Nombre d'humains**", value: totalHumans.toString(), inline: true },
                { name: '**Nombre de bots**', value: totalBots.toString(), inline: true },
                { name: "**Nombre d'utilisateurs en vocal**", value: voiceMembers.toString(), inline: true },
                { name: '**Nombre de boosts**', value: totalBoosts.toString(), inline: true },
                { name: '**Nombre de rôles**', value: totalRoles.toString(), inline: true },
                { name: '**Nombre de salons**', value: totalChannels.toString(), inline: true },
                { name: "**Nombre d'émojis**", value: totalEmojis.toString(), inline: true },
                { name: 'URL personnalisée', value: vanityURLCode, inline: true },
                { name: 'Création du serveur', value: createdAt, inline: true }
            );

        return message.channel.send({ embeds: [embed] });
    }
};
