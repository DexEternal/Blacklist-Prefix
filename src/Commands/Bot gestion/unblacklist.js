const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unblacklist',
    aliases: ['delbl', 'deblacklist', 'unbl', 'removeblacklist', 'removebl'],
    description: "Supprime un utilisateur de la liste noire."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';
    const blacklistKey = 'blacklist';

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

    if (args.length === 0) {
        return message.channel.send("Saisissez une id/mention.");
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

    if (!blacklist.includes(targetId)) {
        return message.channel.send(`\`${targetUser.username}\` n'est pas dans la blacklist.`);
    }

    blacklist = blacklist.filter(id => id !== targetId);
    await db.set(blacklistKey, blacklist);

    return message.channel.send(`\`${targetUser.username}\` a été supprimé de la blacklist.`);
};
