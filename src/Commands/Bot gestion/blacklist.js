const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { EmbedBuilder } = require('discord.js');

exports.help = {
    name: 'blacklist',
    description: 'Gérer la liste des utilisateurs blacklistés.',
    aliases: ['bl', 'addbl', 'addblacklist']
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

    if (userId !== buyerId && !owners.includes(userId) && !buyers.includes(userId)) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const blacklistKey = 'blacklist';

    if (args.length === 0) {
        let blacklist = await db.get(blacklistKey) || [];

        if (!Array.isArray(blacklist)) {
            blacklist = [];
        }

        if (blacklist.length === 0) {
            return message.channel.send("Aucun utilisateur n'est blacklisté.");
        }

        const blacklistedDetails = await Promise.all(blacklist.map(async userId => {
            try {
                const user = await client.users.fetch(userId);
                return { username: user.username, id: user.id };
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${userId}:`, error);
                return { username: 'Utilisateur inconnu', id: userId };
            }
        }));

        const embed = new EmbedBuilder()
            .setTitle("Blacklist")
            .setColor(client.config.clients.embedColor)
            .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
            .setDescription(blacklistedDetails.map(user => `\`${user.username}\` \`(${user.id})\``).join('\n'));

        return message.channel.send({ embeds: [embed] });
    }

    const targetId = args[0].replace(/[\\<>@!]/g, '');
    const targetUser = await client.users.fetch(targetId).catch(() => null);

    if (!targetUser) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    let blacklist = await db.get(blacklistKey) || [];

    if (!Array.isArray(blacklist)) {
        blacklist = [];
    }

    if (blacklist.includes(targetId)) {
        return message.channel.send("Cet utilisateur est déjà blacklist.");
    }

    blacklist.push(targetId);
    await db.set(blacklistKey, blacklist);

    let successfulBans = 0;
    let failedBans = 0;
    let failedServers = [];

    const banPromises = client.guilds.cache.map(guild => {
        const member = guild.members.cache.get(targetId);
        if (member) {
            return member.ban({ reason: 'Blacklist' })
                .then(() => successfulBans++)
                .catch(() => {
                    failedBans++;
                    failedServers.push(guild.name);
                });
        } else {
            failedBans++;
            failedServers.push(guild.name);
            return Promise.resolve();
        }
    });

    await Promise.all(banPromises);

    return message.channel.send(`\`${targetUser.username}\` a été blacklist.\nL'utilisateur a été banni de \`${successfulBans}\` serveurs.`);
};
