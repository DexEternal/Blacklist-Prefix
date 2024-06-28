const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unowner',
    aliases: ['removeowner', 'delowner'],
    description: "Supprime un propriétaire du bot."
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

    if (args.length === 0) {
        return message.channel.send("Saisissez une id/mention.");
    }

    const ownerId = args[0].replace(/[\\<>@!]/g, '');
    const owner = await client.users.fetch(ownerId).catch(() => null);

    if (!owner) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    if (!owners.includes(ownerId)) {
        return message.channel.send(`\`${owner.username}\` n'est pas owner du bot.`);
    }

    owners = owners.filter(id => id !== ownerId);
    await db.set(ownersKey, owners);

    return message.channel.send(`\`${owner.username}\` a été supprimé de la liste des owners.`);
};